import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface ElasticsearchResponse {
  hits?: {
    total?: {
      value?: number;
    };
    hits?: any[];
  };
  suggest?: any;
  aggregations?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  // Use your local proxy URL
  private proxyUrl = 'http://localhost:3000/api/elastic-search';
 
  constructor(private http: HttpClient) { }
 
  /**
   * Optimized product search using index-specific analyzers and fields
   * @param searchTerm The search term entered by user
   * @param size Number of results to return
   * @param filters Optional filters to apply
   * @param sort Optional sorting parameters
   */
  searchProducts(
    searchTerm: string, 
    size: number = 10, 
    filters?: any,
    sort?: any
  ): Observable<any> {
    // Clean and prepare the search term
    const cleanSearchTerm = searchTerm.trim();
    
    // Build an optimized query using your schema
    const query: any = {
      query: {
        bool: {
          should: [
            // Exact match on name with higher boost - highest relevance
            {
              match_phrase: {
                name: {
                  query: cleanSearchTerm,
                  boost: 5
                }
              }
            },
            // Term match on name field using the product_name_analyzer
            {
              match: {
                name: {
                  query: cleanSearchTerm,
                  fuzziness: "AUTO",
                  prefix_length: 2,
                  boost: 3
                }
              }
            },
            // Use the edge_ngram field for better partial matching
            {
              match: {
                "name.suggest": {
                  query: cleanSearchTerm,
                  boost: 2
                }
              }
            },
            // Search in ingredient with lower boost
            {
              match: {
                "ingredient_1": {
                  query: cleanSearchTerm,
                  fuzziness: "AUTO",
                  prefix_length: 2,
                  boost: 2
                }
              }
            },
            // General search across all_text field
            {
              match: {
                all_text: {
                  query: cleanSearchTerm,
                  operator: "OR",
                  fuzziness: "AUTO"
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: size
    };

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      query.query.bool.filter = [];
      
      // Add each filter using the appropriate field type
      for (const [field, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined) {
          const filter: any = {};
          
          // Handle range filters
          if (typeof value === 'object' && (value.hasOwnProperty('gte') || value.hasOwnProperty('lte'))) {
            filter.range = {
              [field]: value
            };
          } else {
            // For keyword fields, use term filter which is more efficient
            // Check if this is a field that should use keyword
            if (field === 'laboratory' || field === 'therapeutic_area' || field === 'concentration') {
              filter.term = {
                [field]: value
              };
            } else if (field === 'name.raw' || field === 'ingredient_1.raw') {
              // Raw keyword fields
              filter.term = {
                [field]: value
              };
            } else {
              // For text fields, use match
              filter.match = {
                [field]: {
                  query: value,
                  operator: "AND"
                }
              };
            }
          }
          
          query.query.bool.filter.push(filter);
        }
      }
    }

    // Add sorting if provided
    if (sort && Object.keys(sort).length > 0) {
      query.sort = [];
      
      // Always include score first for relevance
      query.sort.push("_score");
      
      // Add other sort criteria using the appropriate field (raw for keywords)
      for (const [field, order] of Object.entries(sort)) {
        const sortObj: any = {};
        
        // Use keyword fields for sorting
        if (field === 'name') {
          sortObj['name.raw'] = { order };
        } else if (field === 'ingredient_1') {
          sortObj['ingredient_1.raw'] = { order };
        } else {
          sortObj[field] = { order };
        }
        
        query.sort.push(sortObj);
      }
    }

    // Add highlighting for better user experience
    query.highlight = {
      fields: {
        name: {
          fragment_size: 1000,
          number_of_fragments: 1,
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"]
        },
        ingredient_1: {
          fragment_size: 1000,
          number_of_fragments: 1,
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"]
        },
        all_text: {
          fragment_size: 1000,
          number_of_fragments: 1,
          pre_tags: ["<strong>"],
          post_tags: ["</strong>"]
        }
      }
    };
    
    // Add timeout to prevent long-running queries
    query.timeout = "5s";
    
    console.log('Elasticsearch query:', JSON.stringify(query));
   
    return this.http.post<ElasticsearchResponse>(this.proxyUrl, query)
      .pipe(
        tap(response => {
          console.log('Elasticsearch response status:', response?.hits?.total?.value || 0);
        }),
        map((response: ElasticsearchResponse) => {
          return this.transformToPublications(response);
        }),
        catchError(error => {
          console.error('Elasticsearch error:', error);
          return of({ data: [], total: 0 });
        })
      );
  }

  /**
   * Optimized autocomplete suggestions using completion suggester and edge ngrams
   * @param prefix The prefix to suggest completions for
   * @param size Number of suggestions to return
   */
  getAutocompleteSuggestions(prefix: string, size: number = 5): Observable<any> {
    if (!prefix || prefix.length < 2) {
      return of({ suggestions: [] });
    }

    // Hybrid approach using both completion suggester and edge ngrams
    const query = {
      _source: ["id", "name", "ingredient_1", "laboratory", "therapeutic_area"],
      suggest: {
        name_completion: {
          prefix: prefix,
          completion: {
            field: "name.completion",
            size: size,
            fuzzy: {
              fuzziness: "AUTO"
            }
          }
        }
      },
      query: {
        bool: {
          should: [
            // Edge ngram matching for partial word matches
            {
              match: {
                "name.suggest": {
                  query: prefix,
                  boost: 3
                }
              }
            },
            // Phrase prefix for more accurate suggestions
            {
              match_phrase_prefix: {
                name: {
                  query: prefix,
                  max_expansions: 20,
                  boost: 2
                }
              }
            },
            // Search in ingredients too
            {
              match_phrase_prefix: {
                ingredient_1: {
                  query: prefix,
                  max_expansions: 10,
                  boost: 1
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: size
    };

    return this.http.post<ElasticsearchResponse>(this.proxyUrl, query)
      .pipe(
        map((response: ElasticsearchResponse) => {
          // Process both suggest results and query hits
          const suggestions = [];
          
          // Process query hits
          if (response.hits && response.hits.hits) {
            response.hits.hits.forEach(hit => {
              suggestions.push({
                id: hit._id,
                name: hit._source.name,
                ingredient: hit._source.ingredient_1,
                laboratory: hit._source.laboratory,
                type: hit._source.therapeutic_area,
                score: hit._score
              });
            });
          }
          
          // Process completion suggestions if any
          if (response.suggest && response.suggest.name_completion) {
            response.suggest.name_completion[0].options.forEach(option => {
              // Check if already added from hits to avoid duplicates
              if (!suggestions.some(s => s.id === option._id)) {
                suggestions.push({
                  id: option._id,
                  name: option.text,
                  ingredient: option._source?.ingredient_1,
                  laboratory: option._source?.laboratory,
                  type: option._source?.therapeutic_area,
                  score: option._score
                });
              }
            });
          }
          
          // Sort by score and limit
          return {
            suggestions: suggestions
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .slice(0, size)
          };
        }),
        catchError(error => {
          console.error('Autocomplete error:', error);
          return of({ suggestions: [] });
        })
      );
  }

  /**
   * Optimized related products query using more_like_this and filters
   * @param productId The product ID to find related items for
   * @param size Number of related products to return
   */
  getRelatedProducts(productId: string, size: number = 5): Observable<any> {
    const query = {
      query: {
        more_like_this: {
          fields: ["name", "ingredient_1", "therapeutic_area", "laboratory"],
          like: [
            {
              _index: "products", 
              _id: productId
            }
          ],
          min_term_freq: 1,
          max_query_terms: 20,
          min_doc_freq: 1,
          boost_terms: 1,
          minimum_should_match: "30%"
        }
      },
      // Exclude the source document
      post_filter: {
        bool: {
          must_not: {
            term: {
              "_id": productId
            }
          }
        }
      },
      size: size,
      _source: ["id", "name", "ingredient_1", "laboratory", "therapeutic_area", "product_code", "packaging", "packaging_unit"]
    };

    return this.http.post<ElasticsearchResponse>(this.proxyUrl, query)
      .pipe(
        map((response: ElasticsearchResponse) => {
          return this.transformToPublications(response);
        }),
        catchError(error => {
          console.error('Related products error:', error);
          return of({ data: [], total: 0 });
        })
      );
  }

  /**
   * Optimized analytics query with better aggregations
   */
  getProductAnalytics(): Observable<any> {
    const query = {
      size: 0,
      aggs: {
        top_therapeutic_areas: {
          terms: {
            field: "therapeutic_area",
            size: 20,
            order: { "_count": "desc" }
          }
        },
        top_laboratories: {
          terms: {
            field: "laboratory",
            size: 20,
            order: { "_count": "desc" }
          }
        },
        most_common_concentrations: {
          terms: {
            field: "concentration",
            size: 20,
            order: { "_count": "desc" }
          }
        }
      }
    };

    return this.http.post<ElasticsearchResponse>(this.proxyUrl, query)
      .pipe(
        map((response: ElasticsearchResponse) => {
          return {
            therapeuticAreas: response.aggregations?.top_therapeutic_areas?.buckets || [],
            laboratories: response.aggregations?.top_laboratories?.buckets || [],
            concentrations: response.aggregations?.most_common_concentrations?.buckets || []
          };
        }),
        catchError(error => {
          console.error('Analytics error:', error);
          return of({
            therapeuticAreas: [],
            laboratories: [],
            concentrations: []
          });
        })
      );
  }
 
  /**
   * Helper function to strip HTML tags from a string
   */
  private stripHtmlTags(str: string): string {
    if (!str) return '';
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  }
 
  /**
   * Transform Elasticsearch response to Publication objects
   * Ensures data is in the correct format for ResourceTableComponent
   */
  private transformToPublications(elasticResponse: ElasticsearchResponse): any {
    try {
      const hits = elasticResponse?.hits?.hits || [];
      console.log(`Processing ${hits.length} hits from Elasticsearch`);
     
      if (hits.length === 0) {
        console.log('No hits found in Elasticsearch response');
        return { data: [], total: 0 };
      }
     
      const data = hits.map(hit => {
        const source = hit._source;
        const highlight = hit.highlight || {};
        
        const packaging = source.packaging || '';
        const packagingUnit = source.packaging_unit || '';
        const presentation = packaging + (packagingUnit ? ' ' + packagingUnit : '');
       
        // Use highlighted values if available, otherwise use original
        // Important: Strip HTML tags from the values to avoid rendering issues
        let name = highlight?.name ? highlight.name[0] : source.name || '';
        name = this.stripHtmlTags(name); // Remove HTML tags
        
        let ingredient = highlight?.ingredient_1 ? highlight.ingredient_1[0] : source.ingredient_1 || '';
        ingredient = this.stripHtmlTags(ingredient); // Remove HTML tags
       
        // Make sure the structure exactly matches what your table expects
        return {
          id: source.id?.toString() || hit._id,
          product: {
            productCode: source.product_code || '',
            name: name,
            presentation: presentation,
            details: {
              ingredient_1: ingredient || 'No información disponible',
              laboratory: source.laboratory || 'No información disponible',
              therapeutic_area: source.therapeutic_area || ''
            }
          },
          relevanceScore: hit._score,
          priceText: 'Q ' + (Math.random() * 100 + 50).toFixed(2),
          portalPriceText: 'Q ' + (Math.random() * 80 + 40).toFixed(2),
          discountText: ((Math.random() * 20) + 10).toFixed(2)
        };
      });
      
      return {
        data: data,
        total: elasticResponse?.hits?.total?.value || 0
      };
    } catch (error) {
      console.error('Error transforming Elasticsearch response:', error);
      return {
        data: [],
        total: 0
      };
    }
  }

  /**
   * Perform a direct test search (for debugging)
   */
  testSearch(searchTerm: string): Observable<any> {
    const query = {
      query: {
        multi_match: {
          query: searchTerm,
          fields: ["name^3", "name.suggest^2", "ingredient_1", "all_text"],
          type: "best_fields"
        }
      },
      size: 5
    };

    return this.http.post<ElasticsearchResponse>(this.proxyUrl, query)
      .pipe(
        tap(response => {
          console.log('Test search response count:', response?.hits?.total?.value || 0);
        }),
        catchError(error => {
          console.error('Test search error:', error);
          return of({ error: error.message });
        })
      );
  }
}