import {Component, Input, Output, OnInit, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef, AfterViewInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TableColumn} from 'src/app/@vex/interfaces/table-column.interface';
import {Publication} from 'src/app/models/publication';
import icSearch from '@iconify/icons-ic/twotone-search';
import icFilter from '@iconify/icons-ic/twotone-filter-list';
import icSort from '@iconify/icons-ic/twotone-sort';
import {FormControl, FormGroup, FormBuilder} from '@angular/forms';
import {debounceTime, tap, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {ResourceTableComponent} from 'src/app/core/components/resource-table/resource-table.component';
import {ModalController} from '@ionic/angular';
import {PublicationModalComponent} from '../components/publication-modal/publication-modal.component';
import {AuthService} from 'src/app/core/auth/auth.service';
import {ListService} from '../services/list/list.service';
import {LayoutService} from 'src/app/@vex/services/layout.service';
import { Router, ActivatedRoute } from '@angular/router';
import {BudgetService} from "../services/budget/budget.service";
import {ElasticsearchService} from "../../services/elasticsearch.service";
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInputElement: ElementRef;
  @ViewChild('tooltipMessage', { static: true }) tooltipMessage: any;
  @ViewChild(ResourceTableComponent) table: ResourceTableComponent<Publication>;

  // Form controls for search and filtering
  public searchForm: FormGroup;
  public searchCtrl = new FormControl();
  public suggestionsList: any[] = [];
  public showSuggestions = false;
  
  // Icons
  resourceType = Publication;
  icSearch = icSearch;
  icFilter = icFilter;
  icSort = icSort;
  
  // Search state
  searchParams: any = {
    key: null,
    filters: {},
    sort: {}
  };
  items: any[] = [];
  searchResults: any[] = [];
  isSearching = false;
  totalSearchResults = 0;
  searchError: string = '';
  debugInfo: any = null;
  showFilters: boolean = false;
  
  // Prevent duplicate searches
  private lastSearchTerm: string = '';
  private searchAttempts: number = 0;
  private tableUpdateAttempt: number = 0;
  private tableUpdated: boolean = false;
  
  // Cleanup
  private destroy$ = new Subject<void>();
  
  // Filtering options
  laboratories: string[] = [];
  therapeuticAreas: string[] = [];
  
  // Sorting options
  sortOptions = [
    { label: 'Relevancia', value: 'score' },
    { label: 'Precio (menor a mayor)', value: 'price_asc' },
    { label: 'Precio (mayor a menor)', value: 'price_desc' },
    { label: 'Nombre A-Z', value: 'name_asc' },
    { label: 'Nombre Z-A', value: 'name_desc' },
    { label: 'Laboratório', value: 'laboratory' }
  ];
  
  // Subject to update table data
  private tableDataSubject = new BehaviorSubject<Publication[]>([]);

  directionList = [
    {text: 'Inicio', route: '/web/home'},
    {text: 'Buscar medicamentos', route: '/web/search/'}
  ];

  @Input()
  columns: TableColumn<Publication>[] = [
    {
      label: '', property: 'image', cssClasses: ['img-search align-top pt-5 sm:align-middle sm:py-1'], type: 'image', visible: true, transform: (p) => {
        return 'https://blue-production-s3-public-media.s3.amazonaws.com/productos/' + p.product.productCode + '_1.jpg';
      }
    },
    {label: 'Nombre del producto', property: 'product.name', cssClasses: ['pb-2'], type: 'text', visible: true, sorteable: true},
    {label: 'Principio activo', property: 'product.details.ingredient_1', cssClasses: ['pb-2'], type: 'text', visible: true},
    {label: 'Presentación', property: 'product.presentation', cssClasses: ['pb-2'], type: 'text', visible: true},
    {
      label: 'Precio normal', property: 'priceText', cssClasses: ['pb-2'], type: 'html', visible: true, transform: (p) => {
        return `<del>${p.priceText}</del>`;
      }
    },
    {
      label: 'Precio Bluemeds',
      property: 'portalPriceText',
      cssClasses: ['bluemeds-offer-price-text', 'pb-2'],
      type: 'text',
      visible: true
    },
    {
      label: 'Ahorro', property: 'discountText', cssClasses: ['pb-2'], type: 'html', visible: true, transform: (p) => {
        return `<div class="relative mt-2 sm:mt-0"><span class="bg-[#e45900] text-white pl-1 pr-2 rounded-l-[5px] py-1 text-bottom font-bold flag-search">${p.discountText.includes('Q') ? p.discountText : 'Q ' + p.discountText}</span></div>`;
      }
    },
    {label: '', property: 'button', cssClasses: ['pb-2'], type: 'button', visible: true, sorteable: false, buttonLabel: 'Agregar'}
  ];
  availableActions: any;

  results: boolean = false;
  searchTimer = null;

  @Output() modalClosed = new EventEmitter<void>();

  constructor(
    private matDialog: MatDialog,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private listService: ListService,
    public layoutService: LayoutService,
    private router: Router,
    private route: ActivatedRoute,
    private budgetService: BudgetService,
    private elasticsearchService: ElasticsearchService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.formBuilder.group({
      searchTerm: [''],
      laboratory: [''],
      therapeuticArea: [''],
      sortBy: ['score']
    });
  }

  async openPublicationModal(publication: Publication) {
    const modal = await this.modalCtrl.create({
      component: PublicationModalComponent,
      componentProps: {
        publication
      },
      cssClass: this.layoutService.isMobile() ? '' : 'publication-modal'
    });

    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role === 'add') {
      // Publication was added to cart
      // You can handle this event if needed
    }

    if (this.table) {
      this.table.scrollToRow(publication.id);
      await this.start();
    }
    
    // After modal closes, try to get related products
    // Convert id to string if it's a number to fix type error
    this.loadRelatedProducts(publication.id?.toString());
  }

  publicationSelected(publication: Publication) {
    // mostramos en la url como query param el nombre del producto
    this.router.navigate([], { queryParams: { product_name: publication.product.name}, queryParamsHandling: 'merge' });

    this.openPublicationModal(publication);
  }

  ngOnInit(): void {
    this.start();
    
    // Load filter options first to make them ready
    this.loadFilterOptions();
    
    // Check for search params in the URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['query']) {
          this.searchCtrl.setValue(params['query']);
          this.searchForm.get('searchTerm').setValue(params['query']);
          
          // Filters and sort options
          if (params['lab']) {
            this.searchForm.get('laboratory').setValue(params['lab']);
          }
          
          if (params['area']) {
            this.searchForm.get('therapeuticArea').setValue(params['area']);
          }
          
          if (params['sort']) {
            this.searchForm.get('sortBy').setValue(params['sort']);
          }
          
          // Don't trigger search yet - we'll do it after view init
          // to ensure the table component is ready
        }
      });

    // Set up the search control with debounce for autocomplete
    this.searchCtrl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged(),
        tap(value => {
          if (value && value.length >= 2) {
            this.getAutocompleteSuggestions(value);
          } else {
            this.suggestionsList = [];
            this.showSuggestions = false;
          }
        })
      )
      .subscribe(value => this.onSearch(value));
      
    // React to changes in the filter and sort form controls
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(formValues => {
        this.searchParams.key = formValues.searchTerm;
        
        // Update filters
        this.searchParams.filters = {};
        if (formValues.laboratory) {
          this.searchParams.filters.laboratory = formValues.laboratory;
        }
        if (formValues.therapeuticArea) {
          this.searchParams.filters.therapeutic_area = formValues.therapeuticArea;
        }
        
        // Update sorting
        this.searchParams.sort = {};
        switch(formValues.sortBy) {
          case 'price_asc':
            this.searchParams.sort.price = 'asc';
            break;
          case 'price_desc':
            this.searchParams.sort.price = 'desc';
            break;
          case 'name_asc':
            this.searchParams.sort['name.raw'] = 'asc';
            break;
          case 'name_desc':
            this.searchParams.sort['name.raw'] = 'desc';
            break;
          case 'laboratory':
            this.searchParams.sort['laboratory.raw'] = 'asc';
            break;
          // score is default and doesn't need special handling
        }
        
        // Only perform search if we have a search term
        if (formValues.searchTerm && formValues.searchTerm.length >= 4) {
          this.performElasticSearch(formValues.searchTerm);
        }
      });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit - Table component:', this.table);
    
    // Connect to the table
    this.setupTableConnection();
    
    // Trigger initial search from URL params after view is initialized
    setTimeout(() => {
      const searchTerm = this.searchForm.get('searchTerm').value;
      if (searchTerm && searchTerm.length >= 4) {
        console.log('Triggering initial search from URL params:', searchTerm);
        this.performElasticSearch(searchTerm);
      }
    }, 500);
  }

  ngOnDestroy() {
    // Cleanup subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear any pending timers
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  /**
   * Connect to the table component
   */
  private setupTableConnection() {
    console.log('Setting up table connection');
    
    // First check if table exists
    if (!this.table) {
      console.warn('Table not found in view, will retry in 300ms');
      setTimeout(() => this.setupTableConnection(), 300);
      return;
    }
    
    console.log('Table found:', this.table);
    
    // Create a backup of the original load method
    const originalLoad = this.table.load;
    
    // Override the table's load method to use our search results
    this.table.load = () => {
      console.log('Table.load() called');
      
      // If we already have search results, use them
      if (this.searchResults && this.searchResults.length > 0) {
        console.log('Using search results:', this.searchResults.length);
        this.updateTableWithSearchResults();
        return Promise.resolve();
      }
      
      // Call the original load method as fallback
      if (originalLoad && typeof originalLoad === 'function') {
        console.log('Calling original load method');
        return originalLoad.call(this.table);
      }
      
      return Promise.resolve();
    };
    
    // Update table with current results if available
    if (this.searchResults && this.searchResults.length > 0) {
      this.updateTableWithSearchResults();
    }
    
    console.log('Table connection setup complete');
  }

  /**
   * Update the table with search results
   */
  private updateTableWithSearchResults() {
    try {
      if (!this.table || !this.searchResults || this.searchResults.length === 0) {
        console.warn('Cannot update table: Missing table or search results');
        return;
      }
      
      // Keep track of attempts
      this.tableUpdateAttempt++;
      console.log(`Updating table with ${this.searchResults.length} search results (attempt ${this.tableUpdateAttempt})`);
      
      // Set table data via subject
      if (this.table.subject$) {
        const searchResultsCopy = [...this.searchResults];
        this.table.subject$.next(searchResultsCopy);
        
        // Set table metadata
        this.table.totalElements = this.searchResults.length;
        this.table.hasDataLoaded = true;
        
        // Mark table as updated
        this.tableUpdated = true;
        
        // Debug
        console.log('Table updated with results');
        
        // Force change detection
        this.cdr.detectChanges();
      } else {
        console.warn('Table does not have subject$ property, cannot update table');
      }
      
      // Schedule another update after a delay for reliability
      if (this.tableUpdateAttempt < 3) {
        setTimeout(() => {
          if (this.table && this.table.subject$) {
            // Create a fresh copy to trigger Angular change detection
            const freshCopy = [...this.searchResults];
            this.table.subject$.next(freshCopy);
            this.table.totalElements = freshCopy.length;
            this.cdr.detectChanges();
            console.log('Table update reinforced');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  }

  async start() {
    if (await this.authService.isAuthenticated()) {
      await this.listService.getlist();

      let typeBatche = [];
      if (this.listService.list.data.batches.with_insurance.length > 0) {
        typeBatche = typeBatche.concat(this.listService.list.data.batches.with_insurance);
      }

      if (this.listService.list.data.batches.without_insurance.length > 0) {
        typeBatche = typeBatche.concat(this.listService.list.data.batches.without_insurance);
      }

      if (typeBatche.length > 0) {
        typeBatche.forEach(batch => {
          batch.items.forEach((med: any) => {
            this.items.push(med);
          });
        });
      }
    } else {
      // obtenemos los items guardados en local (si los hay)
      let budget = await this.budgetService.getItemsFromStorage();

      if (budget.length > 0) {
        this.items = budget;
      }
    }
  }

  focusSearchInput() {
    if (this.tooltipMessage) {
      this.tooltipMessage.toggle();
    }
    if (this.searchInputElement && this.searchInputElement.nativeElement) {
      this.searchInputElement.nativeElement.focus();
    }
  }

  onSearch(value: string): void {
    // Reset any previous error
    this.searchError = '';
    
    if (!value) {
      clearTimeout(this.searchTimer);
      
      if (this.table) {
        this.table.totalElements = 0;
        
        // Update table via subject
        if (this.table.subject$) {
          this.table.subject$.next([]);
        }
        
        this.table.hasDataLoaded = true;
      }
      
      // Clear search results
      this.searchResults = [];
      this.debugInfo = null;
      return;
    }

    // Update the form value to keep everything in sync
    this.searchForm.get('searchTerm').setValue(value, { emitEvent: false });
    this.searchParams.key = value;

    if (value.length > 3) {
      // Clear any existing timer to prevent multiple searches
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.performElasticSearch(value);
      }, 300); // Reduced delay for better UX
    }

    if (value.length <= 3) {
      // Clear results for short search terms
      if (this.table) {
        this.table.totalElements = 0;
        
        // Update table via subject
        if (this.table.subject$) {
          this.table.subject$.next([]);
        }
        
        this.table.hasDataLoaded = true;
      }
      
      // Clear search results
      this.searchResults = [];
      this.debugInfo = null;
    }
  }

  performElasticSearch(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 4) {
      return;
    }
    
    // Skip if this is the same search term and we already have results
    if (searchTerm === this.lastSearchTerm && this.searchResults.length > 0 && this.tableUpdated) {
      console.log('Skipping duplicate search for:', searchTerm);
      return;
    }
    
    // Track this search term
    this.lastSearchTerm = searchTerm;
    this.isSearching = true;
    this.searchAttempts++;
    this.tableUpdated = false;
    this.tableUpdateAttempt = 0;
    
    console.log('Searching for:', searchTerm);
    console.log('With filters:', this.searchParams.filters);
    console.log('With sort:', this.searchParams.sort);
    
    // Clear previous results while loading
    this.searchResults = [];
    
    if (this.table) {
      console.log('Clearing table data before search');
      this.table.totalElements = 0;
      
      // Update via subject
      if (this.table.subject$) {
        this.table.subject$.next([]);
      }
      
      this.table.hasDataLoaded = false;
    }
    
    // Update URL with search parameters for shareability
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        query: searchTerm,
        lab: this.searchParams.filters.laboratory || null,
        area: this.searchParams.filters.therapeutic_area || null,
        sort: this.searchForm.get('sortBy').value || 'score'
      },
      queryParamsHandling: 'merge'
    });
    
    this.elasticsearchService.searchProducts(
      searchTerm, 
      100, // Increase size to get more results
      this.searchParams.filters,
      this.searchParams.sort
    ).subscribe({
      next: (results) => {
        console.log('Search results received:', results);
        console.log('Number of results:', results.data?.length || 0);
        console.log('Total count:', results.total || 0);
        
        // Store debug info
        this.debugInfo = {
          resultsTotal: results.total,
          resultsCount: results.data?.length || 0,
          searchTerm: searchTerm,
          filters: this.searchParams.filters,
          searchAttempt: this.searchAttempts
        };
        
        // Save search results
        this.searchResults = results.data || [];
        
        // Clear searching state
        this.isSearching = false;
        
        // Update the table with the search results
        if (this.table) {
          // Allow time for isSearching flag to update in template
          setTimeout(() => {
            this.updateTableWithSearchResults();
          }, 0);
        } else {
          console.warn('Table reference not available');
        }
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.searchError = 'Error connecting to search service: ' + (error.message || 'Unknown error');
        
        if (this.table) {
          this.table.totalElements = 0;
          this.table.hasDataLoaded = true;
          
          // Update via subject
          if (this.table.subject$) {
            this.table.subject$.next([]);
          }
        }
        
        // Clear search results
        this.searchResults = [];
      }
    });
  }
  
  /**
   * Load filter options from Elasticsearch
   */
  loadFilterOptions() {
    this.elasticsearchService.getProductAnalytics().subscribe({
      next: (analytics) => {
        this.laboratories = analytics.laboratories.map(lab => lab.key);
        this.therapeuticAreas = analytics.therapeuticAreas.map(area => area.key);
      },
      error: (error) => {
        console.error('Failed to load filter options:', error);
      }
    });
  }
  
  /**
   * Get autocomplete suggestions as user types
   */
  getAutocompleteSuggestions(prefix: string) {
    if (prefix.length < 2) {
      this.suggestionsList = [];
      this.showSuggestions = false;
      return;
    }
    
    this.elasticsearchService.getAutocompleteSuggestions(prefix).subscribe({
      next: (result) => {
        this.suggestionsList = result.suggestions;
        this.showSuggestions = this.suggestionsList.length > 0;
      },
      error: (error) => {
        console.error('Failed to get suggestions:', error);
        this.suggestionsList = [];
        this.showSuggestions = false;
      }
    });
  }
  
  /**
   * Select a suggestion from the autocomplete dropdown
   */
  selectSuggestion(suggestion: any) {
    this.searchCtrl.setValue(suggestion.name);
    this.suggestionsList = [];
    this.showSuggestions = false;
    this.performElasticSearch(suggestion.name);
  }
  
  /**
   * Load related products after viewing a product
   * @param productId The ID of the product to find related items for (can be string or null/undefined)
   */
  loadRelatedProducts(productId: string | null | undefined) {
    if (!productId) {
      console.warn('Cannot load related products: Invalid product ID');
      return;
    }
    
    this.elasticsearchService.getRelatedProducts(productId).subscribe({
      next: (results) => {
        // You can use these related products for "You might also like" section
        console.log('Related products:', results);
        // Implementation depends on your UI requirements
      },
      error: (error) => {
        console.error('Failed to load related products:', error);
      }
    });
  }

  resetSearch() {
    this.searchCtrl.setValue("");
    this.searchForm.reset({
      searchTerm: '',
      laboratory: '',
      therapeuticArea: '',
      sortBy: 'score'
    });
    this.searchParams = {
      key: null,
      filters: {},
      sort: {}
    };
    
    // Clear the table data
    if (this.table) {
      this.table.totalElements = 0;
      
      // Update via subject
      if (this.table.subject$) {
        this.table.subject$.next([]);
      }
      
      this.table.hasDataLoaded = true;
    }
    
    // Update URL to remove query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
    
    // Reset suggestions
    this.suggestionsList = [];
    this.showSuggestions = false;
    
    // Clear search results and state
    this.searchResults = [];
    this.debugInfo = null;
    this.lastSearchTerm = '';
    this.tableUpdated = false;
    
    // Force change detection
    this.cdr.detectChanges();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  showResultsForm() {
    this.results = true;
  }

  openWindowsWhatsApp() {
    window.open('https://api.whatsapp.com/send/?phone=50224272000&text&type=phone_number&app_absent=0', '_blank');
  }
  
  /**
   * Method to force refresh the table
   */
  forceTableRefresh() {
    console.log('Manual table refresh triggered');
    
    if (!this.table) {
      console.warn('Table component not found');
      return;
    }
    
    if (this.searchResults && this.searchResults.length > 0) {
      console.log(`Forcing refresh with ${this.searchResults.length} items`);
      
      // Reset the table update attempt counter
      this.tableUpdateAttempt = 0;
      
      // Create a fresh copy of the search results
      const freshData = [...this.searchResults];
      
      // Update via subject
      if (this.table.subject$) {
        this.table.subject$.next(freshData);
        
        // Set table metadata
        this.table.totalElements = freshData.length;
        this.table.hasDataLoaded = true;
      }
      
      // Log current table state
      console.log('Current table items:', this.table.totalElements);
      
      // Force change detection
      this.cdr.detectChanges();
      
      // Mark as updated
      this.tableUpdated = true;
      
      // Schedule a follow-up update
      setTimeout(() => {
        if (this.table && this.table.subject$) {
          // Create a new array reference to force update
          this.table.subject$.next([...this.searchResults]);
          this.cdr.detectChanges();
        }
      }, 100);
    } else {
      console.warn('No search results to display');
    }
  }

  /**
   * Handle clicks outside of the suggestions dropdown to close it
   */
  handleOutsideClick(event: Event) {
    if (this.showSuggestions && 
        this.searchInputElement &&
        !this.searchInputElement.nativeElement.contains(event.target) && 
        !event.target['closest']('.suggestions-container')) {
      this.showSuggestions = false;
    }
  }
  
  /**
   * Handle pagination events from the table
   */
  onPageChange(event: any) {
    if (this.searchParams.key && this.searchParams.key.length >= 4) {
      // Implement pagination with Elasticsearch if needed
      // This would require modifying the searchProducts method to accept page parameters
    }
  }
  
  /**
   * Track suggestions by unique identifier for better performance
   */
  trackSuggestions(index: number, item: any) {
    return item?.id || index;
  }
}