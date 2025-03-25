import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnInit, Output, ElementRef , ViewChild } from '@angular/core';
import { TableColumn } from 'src/app/@vex/interfaces/table-column.interface';
import { Model } from '../../data/resources/model';
import { Resource } from '../../data/resources/resource';
import { IResourceDataHandler } from '../../data/resources/resource-data-handler';
import icMoreHoriz from '@iconify/icons-ic/twotone-more-horiz';
import { Router } from '@angular/router';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { fadeInUp400ms } from 'src/app/@vex/animations/fade-in-up.animation';
import { stagger40ms } from 'src/app/@vex/animations/stagger.animation';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormControl } from '@angular/forms';
import icSearch from '@iconify/icons-ic/twotone-search';

import icAdd from '@iconify/icons-ic/twotone-add';
import circleAdd from '@iconify/icons-ic/baseline-add-circle';
import circleCheck from '@iconify/icons-ic/baseline-check-circle';
import { ResourcesService } from '../../data/resources/resources-service.service';
import { MatSort, Sort } from '@angular/material/sort';
import { ResourceDataSource } from '../../data/remote-data-source';
import { MatPaginator } from '@angular/material/paginator';
import { camelToSnake } from '../../helpers/string-helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { TranslateService } from '@ngx-translate/core';

export class ResouceTableTexts {
  resourceName: string;
  resourceNamePlural: string;
}

//@UntilDestroy()
@Component({
  selector: 'app-resource-table',
  templateUrl: './resource-table.component.html',
  styleUrls: ['./resource-table.component.scss'],
  animations: [
    fadeInUp400ms,
    stagger40ms
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'standard'
      } as MatFormFieldDefaultOptions
    }
  ]

})

export class ResourceTableComponent<T extends Model> implements OnInit, AfterViewInit {
  @Input() type: new () => T
  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  @Input() title:string;
  @Input() texts: ResouceTableTexts = new ResouceTableTexts()
  @Input() dataHandler: IResourceDataHandler
  @Input() columnsDefinitions: TableColumn<T>[] = [
    { label: 'ID', property: 'id', type: 'text', visible: true },
    { label: 'Activo', property: 'active', type: 'boolean', visible: true},
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];
  @Input() manageColumn:string = "id";
  @Input() actions = null
  @Input() editRoute = null
  @Input() public viewColumn: string = null
  @Input() managementRoute: string

  @Input() parentResource: Resource<Model>;
  @Input() parent: Model;

  @Input() displaceTop: boolean = true;
  @Input() showHeader: boolean = true;

  @Input() rcp: string = null;
  @Input() rcpParams: any = {};

  @Input() customClass: string = "";
  @Input() items: any[] = [];

  @Output() onRowClick: EventEmitter<T> = new EventEmitter<T>();
  @Output() onButtonClick: EventEmitter<T> = new EventEmitter<T>();

  resource: Resource<T>

  collection: T[]
  public dataSource: ResourceDataSource<T> | null;
  public icMoreHoriz = icMoreHoriz
  public availableActions = null
  hasDataLoaded: boolean = false;

  subject$: ReplaySubject<T[]> = new ReplaySubject<T[]>(1);
  data$: Observable<T[]> = this.subject$.asObservable();
  public searchCtrl = new FormControl();
  icSearch = icSearch;
  icAdd = icAdd;
  circleAdd = circleAdd;
  circleCheck = circleCheck;
  pageSize = 20;
  currentPage = 0;
  pageSizeOptions: number[] = [20];
  totalElements: number = 0;
  meta: any;

  isSortable(propertyName: string)
  {
    if(!this.meta?.sortable_by) return false;
    return this.meta?.sortable_by?.includes(propertyName) || this.meta?.sortable_by?.includes(camelToSnake(propertyName))
  }

  get columnsForced(): TableColumn<T>[] {
    return this.columnsDefinitions;
  }

  /*toTemplate(html:string): TemplateRef<any> {
    return new TemplateRef(value) as any;
  }*/

  get columns(): TableColumn<T>[] {
    if(this.layoutService.isMobile())
    {
      return [
        { label: 'Thumbnail', property: 'thumb', type: 'text', visible: true, sorteable: true },
        { label: 'Mobile', property: 'mobile', type: 'text', visible: true, sorteable: true }
      ]
    }
    return this.columnsDefinitions;
  }

  get visibleColumns() {

    return this.columns.filter(column => column.visible).map(column => column.property);
  }


  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router,
              private matDialog: MatDialog,
              private resourcesService: ResourcesService,
              private matSnackbar: MatSnackBar,
              private zone: NgZone,
              public layoutService:LayoutService,
              private translate: TranslateService,
  ) {
    this.default();
    translate.setDefaultLang('es');
    translate.use(navigator.language.slice(0,2));
  }

  scrollToRow(rowId: number) {
    const element = document.getElementById('row-' + rowId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  default() {
    const self = this
    this.availableActions = [
      {
        label: "Editar",
        click: {
          type: "link",
          onClick: (role: T) => {
            self.router.navigateByUrl(this.managementRoute + "/" + this.getObjectPropertyByString(role, this.manageColumn))
          }
        },
        icIcon: icEdit
      },
      {
        label: "Borrar",
        click: {
          type: "func",
          onClick: (role: T) => {
            self.deleteResource(role)
          }
        },
        icIcon: icDelete
      }
    ]
  }

  async deleteResource(role: T) {
    this.matDialog.open(ConfirmationDialogComponent, {
      disableClose: false,
      width: '400px',
      data: {
        message: "Confirmar borrado" + (this.viewColumn ? ": " + role[this.viewColumn] : ""),
      }
    }).afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.getResource().destroy(role)
          this.subject$.next((await this.resource.index()).data);
          let id = role.id;
          await this.load();

          this.matSnackbar.open(id + ": Borrado correctamente", null, {
            duration: 3000,
            panelClass: "bg-success",
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        } catch (e) {
          let msg = "Ocurrió un error";
          if (e.status == 422) {
            msg = e.error?.message;
          }


          this.matSnackbar.open(msg, null, {
            duration: 3000,
            panelClass: "bg-danger",
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }

      }
    });
  }

  dateFormat(date, format) {
    return moment(date).format(format)
  }

  private getResource() {
    return this.resourcesService.getResource(this.type);
  }

  getData() {
    return this.resource.index()
  }

  async load() {
    this.hasDataLoaded = false;

    if (this.type) {
      if(this.parentResource)
        this.resource = this.parentResource.getChildResource(this.type, this.parent);
      else
        this.resource = this.resourcesService.getResource(this.type)

      this.dataSource = new ResourceDataSource(this.resource);
      let pagination = null;
      if(!this.rcp)
      {
        pagination = await this.dataSource.loadResource(this.sort?.active ? camelToSnake(this.sort?.active) : null, this.sort?.direction, this.paginator?.pageIndex + 1, this.paginator?.pageSize, this.searchString);
      }
      else {
        pagination = await this.dataSource.execute(this.rcp, this.rcpParams, this.sort?.active ? camelToSnake(this.sort?.active) : null, this.sort?.direction, this.paginator?.pageIndex + 1, this.paginator?.pageSize, this.searchString)
      }

      this.meta = pagination.meta;

      this.pageSize = pagination.meta.page_size;
      this.currentPage = pagination.meta.current_page - 1;
      this.totalElements = pagination.meta.total;

      this.hasDataLoaded = pagination.data.length > 0;

      this.zone.run(() => {

      });

    }
    else {
      throw "[type] is not setted"
    }
  }

  searchString: string = null;

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.load())
      )
      .subscribe();

    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(150),
        //untilDestroyed(true),
        tap(() => this.paginator.pageIndex = 0)
      )
      .subscribe(value => this.onSearch(value));
  }

  async onSearch(value: string) {

    this.searchString = value;
    this.load();

  }

  public getObjectPropertyByString(object: Object, route: string): keyof T | any {
    let obj = object;
    var arr = route.split(".");
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
  }

  ngOnInit() {
    this.load();



    /*this.getData().then(roles => {
      this.subject$.next(roles.data);
    });

    this.dataSource = new MatTableDataSource();

    this.data$.pipe(
      filter<T[]>(Boolean)
    ).subscribe(roles => {
      this.collection = roles;
      this.dataSource.data = roles;
    });*/


    /* this.searchCtrl.valueChanges.pipe(
       untilDestroyed(this)
     ).subscribe(value => this.onFilterChange(value));*/
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  rowAction(event, row) {
    event.stopPropagation();
    this.onRowClick?.emit(row)
  }

  buttonAction(event, row) {
    event.stopPropagation();
    this.onButtonClick.emit(row);
  }

  announceSortChange(sortState: Sort) {
    this.onSortChange(sortState)
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  private async onSortChange(sortState: Sort) {

    const pagination = await this.dataSource.loadResource(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize);

    this.pageSize = pagination.meta.page_size;
    this.currentPage = pagination.meta.page_size - 1;
    this.totalElements = pagination.meta.total;

  }

  compareMeds(row: any): boolean {
    // comparamos la row con nuestra lista de medicamentos
    let flag = false;

    if (this.items.some(item => item.publication.id === row.id) ) {
      flag = true
    }

    return flag;
  }
}

