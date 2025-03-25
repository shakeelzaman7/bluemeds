const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Elasticsearch configuration
const ELASTIC_HOST = 'https://25d8fd86a59644df8704717a4be06839.us-east-1.aws.found.io:443';
const ELASTIC_AUTH = 'elastic:8s3HPupgMRz2EfAjvHOCNQDW';
const ELASTIC_INDEX = 'catalog';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase request body size limit

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(500).json({ error: 'Server error', message: err.message });
});

// Main search endpoint
app.post('/api/elastic-search', async (req, res) => {
  try {
    console.log('Received search request:', JSON.stringify(req.body, null, 2));
   
    const response = await axios.post(
      `${ELASTIC_HOST}/${ELASTIC_INDEX}/_search`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(ELASTIC_AUTH).toString('base64')
        },
        timeout: 10000 // Set timeout to 10 seconds
      }
    );
   
    console.log('Elasticsearch response status:', response.status);
    console.log('Elasticsearch result count:', response.data?.hits?.total?.value || 0);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

// Improved autocomplete suggestions endpoint
app.get('/api/suggestions', async (req, res) => {
  try {
    const { prefix = '', size = 5 } = req.query;
    
    if (!prefix || prefix.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const query = {
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                name: {
                  query: prefix,
                  max_expansions: 50,
                  boost: 3
                }
              }
            },
            {
              match_phrase_prefix: {
                ingredient_1: {
                  query: prefix,
                  max_expansions: 25,
                  boost: 2
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: parseInt(size),
      _source: ["id", "name", "ingredient_1", "laboratory", "therapeutic_area"]
    };
    
    const response = await axios.post(
      `${ELASTIC_HOST}/${ELASTIC_INDEX}/_search`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(ELASTIC_AUTH).toString('base64')
        },
        timeout: 5000 // Shorter timeout for autocomplete
      }
    );
    
    const hits = response.data?.hits?.hits || [];
    const suggestions = hits.map(hit => ({
      id: hit._id,
      name: hit._source.name,
      ingredient: hit._source.ingredient_1,
      laboratory: hit._source.laboratory,
      type: hit._source.therapeutic_area
    }));
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.status(500).json({ error: 'Suggestions failed', message: error.message });
  }
});

// Get product analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const query = {
      size: 0,
      aggs: {
        top_therapeutic_areas: {
          terms: {
            field: "therapeutic_area",
            size: 10
          }
        },
        top_laboratories: {
          terms: {
            field: "laboratory",
            size: 10
          }
        },
        most_common_concentrations: {
          terms: {
            field: "concentration",
            size: 10
          }
        }
      }
    };
    
    const response = await axios.post(
      `${ELASTIC_HOST}/${ELASTIC_INDEX}/_search`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(ELASTIC_AUTH).toString('base64')
        }
      }
    );
    
    res.json({
      therapeuticAreas: response.data.aggregations?.top_therapeutic_areas?.buckets || [],
      laboratories: response.data.aggregations?.top_laboratories?.buckets || [],
      concentrations: response.data.aggregations?.most_common_concentrations?.buckets || []
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ error: 'Analytics failed', message: error.message });
  }
});

// Get related products
app.get('/api/related/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { size = 5 } = req.query;
    
    const query = {
      query: {
        more_like_this: {
          fields: ["name", "ingredient_1", "therapeutic_area"],
          like: [
            {
              _index: ELASTIC_INDEX,
              _id: productId
            }
          ],
          min_term_freq: 1,
          max_query_terms: 12
        }
      },
      size: parseInt(size),
      _source: ["id", "name", "ingredient_1", "laboratory", "therapeutic_area", "product_code", "packaging", "packaging_unit"]
    };
    
    const response = await axios.post(
      `${ELASTIC_HOST}/${ELASTIC_INDEX}/_search`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(ELASTIC_AUTH).toString('base64')
        }
      }
    );
    
    // Transform results to match the expected format
    const hits = response.data?.hits?.hits || [];
    const data = hits.map(hit => {
      const source = hit._source;
      
      const packaging = source.packaging || '';
      const packagingUnit = source.packaging_unit || '';
      const presentation = packaging + (packagingUnit ? ' ' + packagingUnit : '');
      
      return {
        id: source.id?.toString() || hit._id,
        product: {
          productCode: source.product_code || '',
          name: source.name || '',
          presentation: presentation,
          details: {
            ingredient_1: source.ingredient_1 || 'No información disponible',
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
    
    res.json({
      data: data,
      total: response.data?.hits?.total?.value || 0
    });
  } catch (error) {
    console.error('Related products error:', error.message);
    res.status(500).json({ error: 'Related products failed', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Direct Elasticsearch test endpoint for debugging
app.post('/api/test-elastic', async (req, res) => {
  try {
    const { query, index = ELASTIC_INDEX } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    const response = await axios.post(
      `${ELASTIC_HOST}/${index}/_search`,
      query,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(ELASTIC_AUTH).toString('base64')
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Test query error:', error.message);
    res.status(500).json({ error: 'Test query failed', message: error.message });
  }
});

// Log search history (you could store this in a database)
app.post('/api/log-search', (req, res) => {
  const { searchTerm, userId, filters, results } = req.body;
  
  console.log('Search log:', {
    timestamp: new Date().toISOString(),
    searchTerm,
    userId,
    filters,
    resultCount: results?.length || 0
  });
  
  res.status(200).json({ logged: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Access health check at http://localhost:${PORT}/health`);
  console.log(`Elasticsearch proxy endpoint at http://localhost:${PORT}/api/elastic-search`);
  console.log(`Autocomplete suggestions at http://localhost:${PORT}/api/suggestions?prefix=<term>`);
  console.log(`Product analytics at http://localhost:${PORT}/api/analytics`);
  console.log(`Related products at http://localhost:${PORT}/api/related/:productId`);
  console.log(`Test Elasticsearch directly at http://localhost:${PORT}/api/test-elastic (POST)`);
});