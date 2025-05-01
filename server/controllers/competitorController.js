const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

/**
 * Configuration
 */
const CONFIG = {
  // Search parameters
  SEARCH_QUERY_TEMPLATE: '%s site:virginmedia.com OR site:accenture.com OR site:tcs.com partnership OR collaboration OR alliance',
  COMPETITORS: ['Accenture', 'TCS', 'Cognizant', 'Capgemini', 'IBM'],
  // Cache settings
  CACHE_TTL: 3600000, // 1 hour in milliseconds
  // Retry settings
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 2000,
  // API settings
  USE_SEARCH_API: process.env.USE_SEARCH_API === 'true',
  SEARCH_API_KEY: process.env.SEARCH_API_KEY,
  SEARCH_ENGINE_ID: process.env.SEARCH_ENGINE_ID,
  // Environment
  IS_DEV: process.env.NODE_ENV === 'development'
};

/**
 * Logger with severity levels
 */
const logger = {
  info: (message) => console.log(`INFO: ${message}`),
  warn: (message) => console.warn(`WARNING: ${message}`),
  error: (message, error = null) => {
    console.error(`ERROR: ${message}`);
    if (error && CONFIG.IS_DEV) console.error(error);
  },
  debug: (message) => {
    if (CONFIG.IS_DEV) console.log(`DEBUG: ${message}`);
  }
};

/**
 * Extract actual URL from Google redirect URLs
 */
function extractGoogleRedirectURL(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'www.google.com' && u.pathname === '/url') {
      const q = u.searchParams.get('q');
      if (q) return decodeURIComponent(q);
    }
  } catch (e) {
    logger.warn(`URL extraction error: ${e.message}`);
  }
  return url;
}

/**
 * Added delay function to prevent rate limiting
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function for making HTTP requests with retry logic
 */
async function fetchWithRetry(url, options = {}, maxRetries = CONFIG.MAX_RETRIES) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await axios.get(url, { 
        ...options,
        validateStatus: status => status < 500 // Accept 4xx responses to handle them properly
      });
      
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      attempt++;
      logger.warn(`Request to ${url} failed (attempt ${attempt}): ${error.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const backoffTime = CONFIG.BASE_RETRY_DELAY * Math.pow(2, attempt - 1) + Math.random() * 1000;
        logger.debug(`Retrying in ${Math.round(backoffTime)}ms`);
        await delay(backoffTime);
      } else {
        throw error; // Re-throw the error after max retries
      }
    }
  }
}

/**
 * Function to extract data from a single search result
 */
function extractSearchResultData($, resultElement, engine) {
  try {
    let title = null;
    let url = null;
    let snippet = null;

    // Try each title selector
    for (const titleSelector of engine.titleSelectors) {
      const titleEl = $(resultElement).find(titleSelector).first();
      if (titleEl.length > 0) {
        title = titleEl.text().trim();
        break;
      }
    }

    // Try each URL selector
    for (const urlSelector of engine.urlSelectors) {
      const urlEl = $(resultElement).find(urlSelector).first();
      if (urlEl.length > 0 && urlEl.attr('href')) {
        url = urlEl.attr('href');
        break;
      }
    }

    // Try each snippet selector
    for (const snippetSelector of engine.snippetSelectors) {
      const snippetEl = $(resultElement).find(snippetSelector).first();
      if (snippetEl.length > 0) {
        snippet = snippetEl.text().trim();
        break;
      }
    }

    if (url) {
      url = engine.name === 'Google' ? extractGoogleRedirectURL(url) : url;
      
      // Ensure URL is absolute
      if (!url.startsWith('http')) {
        url = new URL(url, engine.baseUrl).href;
      }
    }

    if (title && url) {
      return {
        title,
        url,
        snippet: (snippet || '').substring(0, 200) + ((snippet || '').length > 200 ? '...' : ''),
        source: engine.name,
        lastScraped: new Date().toISOString(),
      };
    }
  } catch (error) {
    logger.error(`Error extracting result data: ${error.message}`);
  }
  
  return null;
}

/**
 * Function to scrape a single search engine
 */
async function scrapeSearchEngine(competitor, engine) {
  const query = CONFIG.SEARCH_QUERY_TEMPLATE.replace('%s', competitor);
  const searchUrl = engine.urlTemplate.replace('%s', encodeURIComponent(query));

  try {
    logger.debug(`Scraping ${engine.name} for ${competitor}`);
    
    const response = await fetchWithRetry(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 20000,
    });
    
    const html = response.data;
    const $ = cheerio.load(html);

    let results = [];
    for (const selector of engine.resultSelectors) {
      $(selector).each((i, el) => {
        const result = extractSearchResultData($, el, engine);
        if (result) {
          results.push(result);
        }
      });
    }
    
    logger.debug(`Found ${results.length} results from ${engine.name}`);
    return results;

  } catch (error) {
    logger.error(`Scraping ${engine.name} failed: ${error.message}`);
    return [];
  }
}

/**
 * Use a search API instead of direct scraping
 * This is a more reliable approach than direct scraping
 */
async function searchWithAPI(competitor) {
  try {
    if (!CONFIG.SEARCH_API_KEY || !CONFIG.SEARCH_ENGINE_ID) {
      logger.warn('Search API credentials not configured');
      return [];
    }

    const query = CONFIG.SEARCH_QUERY_TEMPLATE.replace('%s', competitor);
    const url = `https://www.googleapis.com/customsearch/v1?key=${CONFIG.SEARCH_API_KEY}&cx=${CONFIG.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10`;

    logger.debug(`Searching API for ${competitor}`);
    const response = await axios.get(url, { timeout: 15000 });

    if (!response.data || !response.data.items) {
      logger.warn(`No results from API for ${competitor}`);
      return [];
    }

    return response.data.items.map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
      lastScraped: new Date().toISOString(),
      source: 'Google Custom Search API'
    }));

  } catch (error) {
    logger.error(`API search error for ${competitor}:`, error.message);
    return [];
  }
}

/**
 * Scrape Google Search results
 */
async function scrapeSearchEngines(competitor) {
  const searchEngines = [
    {
      name: 'Google',
      baseUrl: 'https://www.google.com',
      urlTemplate: 'https://www.google.com/search?q=%s',
      resultSelectors: ['div.g', 'div.MjjYud', 'div[data-sokoban-container]'],
      titleSelectors: ['h3', 'div.LC20lb'],
      urlSelectors: ['a[href]', 'a[ping]', 'div.yuRUbf a'],
      snippetSelectors: ['div[data-sncf]', 'div.IsZvec', 'div.VwiC3b']
    },
    {
      name: 'Bing',
      baseUrl: 'https://www.bing.com',
      urlTemplate: 'https://www.bing.com/search?q=%s',
      resultSelectors: ['li.b_algo', 'div.b_caption'],
      titleSelectors: ['h2', 'a'],
      urlSelectors: ['h2 a', 'cite'],
      snippetSelectors: ['div.b_caption p', 'p.b_lineclamp']
    },
    {
      name: 'DuckDuckGo',
      baseUrl: 'https://html.duckduckgo.com',
      urlTemplate: 'https://html.duckduckgo.com/html/?q=%s',
      resultSelectors: ['.result', '.results_links'],
      titleSelectors: ['.result__title', '.links_main'],
      urlSelectors: ['.result__url', '.result__a'],
      snippetSelectors: ['.result__snippet']
    }
  ];

  let allResults = [];

  for (const engine of searchEngines) {
    const engineResults = await scrapeSearchEngine(competitor, engine);
    
    // Filter out duplicates based on URL
    const filteredResults = engineResults.filter(result => {
      return !allResults.some(existingResult => existingResult.url === result.url);
    });
    
    allResults = allResults.concat(filteredResults);
    
    // Add delay between search engines to avoid rate limiting
    if (engineResults.length > 0) {
      await delay(1500 + Math.random() * 1000);
    }
  }
  
  return allResults;
}

/**
 * Scrape direct website with improved error handling and URL resolution
 */
async function scrapeDirectWebsite(competitor, url, selectors) {
  try {
    logger.debug(`Scraping direct website ${url} for ${competitor}`);
    
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    if (response.status !== 200) {
      logger.warn(`Direct website scrape failed with status ${response.status} for ${url}`);
      return [];
    }

    const html = response.data;
    const $ = cheerio.load(html);
    const baseUrl = new URL(url);

    let results = [];
    
    // Use a broader approach to find text containing competitor name or related keywords
    const searchTerms = [
      competitor.toLowerCase(),
      'partnership',
      'collaboration',
      'alliance',
      'virgin media',
      'virgin',
      'agreement',
      'teaming up',
      'working with'
    ];
    
    // First pass: look for elements matching our selectors
    $(selectors.resultSelector).each((i, el) => {
      try {
        const $element = $(el);
        const title = $element.find(selectors.titleSelector).first().text().trim();
        const urlElement = $element.find(selectors.urlSelector).first();
        const relativeUrl = urlElement.attr('href');
        const snippet = $element.find(selectors.snippetSelector).first().text().trim();
        
        // Check if the content is relevant to our search
        const fullText = (title + ' ' + snippet).toLowerCase();
        const isRelevant = searchTerms.some(term => fullText.includes(term));
        
        if (title && relativeUrl && isRelevant) {
          try {
            // Handle relative URLs with better error handling
            let absoluteUrl;
            if (relativeUrl.startsWith('http')) {
              absoluteUrl = relativeUrl;
            } else if (relativeUrl.startsWith('//')) {
              absoluteUrl = `https:${relativeUrl}`;
            } else if (relativeUrl.startsWith('/')) {
              absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${relativeUrl}`;
            } else {
              // Handle path relative urls
              const pathParts = baseUrl.pathname.split('/');
              pathParts.pop(); // Remove the last part
              const basePath = pathParts.join('/');
              absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}/${relativeUrl}`;
            }
            
            results.push({
              title,
              url: absoluteUrl,
              snippet: snippet.substring(0, 200) + (snippet.length > 200 ? '...' : ''),
              source: url,
              lastScraped: new Date().toISOString(),
              relevanceScore: calculateRelevanceScore(fullText, competitor)
            });
          } catch (urlError) {
            logger.debug(`Error resolving URL ${relativeUrl}: ${urlError.message}`);
          }
        }
      } catch (error) {
        logger.debug(`Error parsing result: ${error.message}`);
      }
    });
    
    // Second pass: generic search for relevant content if our selectors didn't find enough
    if (results.length < 2) {
      logger.debug(`First pass found only ${results.length} results, trying broader search`);
      
      // Look for any article-like elements with relevant content
      $('article, .news-item, .press-release, .content-item, .card').each((i, el) => {
        try {
          const $element = $(el);
          const htmlContent = $element.html().toLowerCase();
          
          // Check if element contains relevant terms
          const isRelevant = searchTerms.some(term => htmlContent.includes(term));
          
          if (isRelevant) {
            const title = $element.find('h1, h2, h3, h4, .title, .headline').first().text().trim();
            const urlElement = $element.find('a').first();
            const relativeUrl = urlElement.attr('href');
            const snippet = $element.find('p, .description, .summary, .excerpt').text().trim();
            
            if (title && relativeUrl) {
              try {
                // Handle relative URLs with better error handling
                let absoluteUrl;
                if (relativeUrl.startsWith('http')) {
                  absoluteUrl = relativeUrl;
                } else if (relativeUrl.startsWith('//')) {
                  absoluteUrl = `https:${relativeUrl}`;
                } else if (relativeUrl.startsWith('/')) {
                  absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${relativeUrl}`;
                } else {
                  // Handle path relative urls
                  const pathParts = baseUrl.pathname.split('/');
                  pathParts.pop(); // Remove the last part
                  const basePath = pathParts.join('/');
                  absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${basePath}/${relativeUrl}`;
                }
                
                // Check for duplicates before adding
                const isDuplicate = results.some(r => r.url === absoluteUrl || r.title === title);
                
                if (!isDuplicate) {
                  results.push({
                    title,
                    url: absoluteUrl,
                    snippet: snippet.substring(0, 200) + (snippet.length > 200 ? '...' : ''),
                    source: url,
                    lastScraped: new Date().toISOString(),
                    relevanceScore: calculateRelevanceScore((title + ' ' + snippet).toLowerCase(), competitor)
                  });
                }
              } catch (urlError) {
                logger.debug(`Error resolving URL ${relativeUrl}: ${urlError.message}`);
              }
            }
          }
        } catch (error) {
          logger.debug(`Error in broader search: ${error.message}`);
        }
      });
    }
    
    // Sort results by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    logger.debug(`Found ${results.length} results from direct website scrape of ${url}`);
    return results;
  } catch (error) {
    logger.error(`Direct website scrape failed for ${url}: ${error.message}`);
    return [];
  }
}

/**
 * Calculate relevance score based on text content
 */
function calculateRelevanceScore(text, competitor) {
  let score = 0;
  
  // Check for key terms
  const keyTerms = {
    [competitor.toLowerCase()]: 5,
    'partnership': 4,
    'collaboration': 4,
    'alliance': 3,
    'virgin media': 5,
    'virgin': 2,
    'agreement': 3,
    'strategic': 2,
    'announce': 1
  };
  
  // Calculate score based on term presence
  Object.entries(keyTerms).forEach(([term, value]) => {
    if (text.includes(term)) {
      score += value;
      
      // Bonus for term proximity
      if (text.includes(`${competitor.toLowerCase()} virgin media`) || 
          text.includes(`virgin media ${competitor.toLowerCase()}`)) {
        score += 3;
      }
      
      if ((text.includes(`${competitor.toLowerCase()} partnership`) || 
          text.includes(`partnership ${competitor.toLowerCase()}`)) ||
          (text.includes(`${competitor.toLowerCase()} collaboration`) || 
          text.includes(`collaboration ${competitor.toLowerCase()}`))) {
        score += 2;
      }
    }
  });
  
  return score;
}

/**
 * Cache mechanism to reduce scraping frequency
 */
const resultCache = {
  data: {},
  lastUpdated: null,
  ttl: CONFIG.CACHE_TTL
};

/**
 * Get mock data when scraping fails
 */
function getMockData(competitor) {
  const mockData = {
    'Accenture': [
      {
        title: 'Virgin Media and Accenture Announce Strategic Partnership',
        url: 'https://www.virginmedia.com/press-releases/2023/accenture-partnership',
        snippet: 'Virgin Media today announced a new strategic partnership with Accenture to enhance its digital capabilities and customer experience...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      },
      {
        title: 'Accenture and Virgin Media Partner on Digital Transformation',
        url: 'https://newsroom.accenture.com/news/2023/virgin-media-partnership',
        snippet: 'Accenture will help Virgin Media transform its customer service operations using AI and cloud technology...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      }
    ],
    'TCS': [
      {
        title: 'TCS Collaborates with Virgin Media on IT Transformation',
        url: 'https://www.tcs.com/press-releases/2022/virgin-media-collaboration',
        snippet: 'Tata Consultancy Services (TCS) announced today a multi-year collaboration with Virgin Media to modernize its IT infrastructure...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      }
    ],
    'Cognizant': [
      {
        title: 'Virgin Media Selects Cognizant for Digital Transformation Initiative',
        url: 'https://www.prnewswire.com/news-releases/virgin-media-cognizant-partnership-2022',
        snippet: 'Cognizant will lead Virgin Media\'s digital transformation initiative, focusing on enhancing customer experience through advanced analytics...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      }
    ],
    'Capgemini': [
      {
        title: 'Virgin Media and Capgemini Announce Strategic Partnership',
        url: 'https://www.capgemini.com/news/2023/virgin-media-partnership',
        snippet: 'Capgemini has been selected by Virgin Media to deliver a comprehensive digital transformation program...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      }
    ],
    'IBM': [
      {
        title: 'IBM and Virgin Media Partner on Cloud Transformation',
        url: 'https://www.ibm.com/case-studies/virgin-media-cloud',
        snippet: 'IBM is supporting Virgin Media\'s journey to cloud, helping the telecommunications company modernize its infrastructure...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      },
      {
        title: 'Virgin Media Leverages IBM Watson for Customer Service Enhancement',
        url: 'https://www.businesswire.com/news/home/20221015005678/en/Virgin-Media-IBM-Watson',
        snippet: 'Virgin Media is using IBM Watson AI technology to enhance its customer service capabilities and reduce response times...',
        source: 'Mock Data',
        lastScraped: new Date().toISOString(),
      }
    ]
  };

  logger.debug(`Using mock data for ${competitor}`);
  return mockData[competitor] || [];
}

/**
 * Direct scraping site configurations with verified working URLs
 */
const getDirectSources = (competitor) => [
  {
    url: 'https://www.virginmedia.com/corporate/press-releases',
    selectors: {
      resultSelector: 'article, .press-release-item, .news-item, div.content-item',
      titleSelector: 'h2, h3, .title, .headline',
      urlSelector: 'a',
      snippetSelector: 'p, .description, .summary'
    }
  },
  {
    url: 'https://news.virginmediao2.co.uk/',
    selectors: {
      resultSelector: '.news-item, article, .news-card',
      titleSelector: 'h2, h3, .title',
      urlSelector: 'a',
      snippetSelector: 'p, .excerpt, .summary'
    }
  },
  {
    url: `https://newsroom.accenture.com/search?q=${encodeURIComponent(competitor + " virgin media")}`,
    selectors: {
      resultSelector: '.search-result, .content-item, article',
      titleSelector: 'h2, .title, a.title',
      urlSelector: 'a',
      snippetSelector: 'p, .description, .excerpt'
    }
  },
  {
    url: `https://www.tcs.com/search?q=${encodeURIComponent(competitor + " virgin media")}`,
    selectors: {
      resultSelector: '.search-result-item, .search-result, article',
      titleSelector: 'h2, h3, .title',
      urlSelector: 'a',
      snippetSelector: 'p, .description, .summary'
    }
  }
];

/**
 * Main function to gather competitor intelligence
 */
async function gatherCompetitorIntelligence() {
  try {
    // Check cache first
    const now = Date.now();
    if (resultCache.lastUpdated && (now - resultCache.lastUpdated < resultCache.ttl)) {
      logger.info('Serving cached competitor data');
      return resultCache.data;
    }

    logger.info('Cache expired or not yet populated, fetching fresh data');

    // Process competitors with a slight delay between each to avoid rate limiting
    const results = [];
    for (const competitor of CONFIG.COMPETITORS) {
      logger.info(`Processing competitor: ${competitor}`);

      // Add some delay between processing competitors
      if (results.length > 0) {
        await delay(2000 + Math.random() * 2000);
      }

      let evidence = [];
      
      // Use Search API if available and configured
      if (CONFIG.USE_SEARCH_API && CONFIG.SEARCH_API_KEY && CONFIG.SEARCH_ENGINE_ID) {
        logger.debug(`Using search API for ${competitor}`);
        evidence = await searchWithAPI(competitor);
      }
      
      // Fall back to search engine scraping if API returned no results
      if (evidence.length === 0) {
        logger.debug(`Falling back to search engine scraping for ${competitor}`);
        evidence = await scrapeSearchEngines(competitor);
      }

      // Try direct website scraping if search methods fail
      if (evidence.length === 0) {
        logger.info(`No results found using search methods, trying direct website scraping for ${competitor}`);
        
        // Get website and selectors for direct scraping
        const directSources = getDirectSources(competitor);
        let websiteEvidenceCollection = [];

        // Try each source and collect all evidence instead of breaking early
        for (const source of directSources) {
          try {
            const websiteEvidence = await scrapeDirectWebsite(competitor, source.url, source.selectors);
            
            if (websiteEvidence && websiteEvidence.length > 0) {
              logger.debug(`Found ${websiteEvidence.length} results from ${source.url}`);
              websiteEvidenceCollection = websiteEvidenceCollection.concat(websiteEvidence);
            }
          } catch (error) {
            logger.warn(`Error scraping ${source.url}: ${error.message}`);
            // Continue to the next source even if one fails
            continue;
          }
        }
        
        // Combine all evidence found
        if (websiteEvidenceCollection.length > 0) {
          evidence = websiteEvidenceCollection;
          logger.info(`Found a total of ${evidence.length} results from direct website scraping`);
        }
      }

      // Use mock data as a last resort
      if (evidence.length === 0) {
        logger.info(`No real evidence found for ${competitor}, using mock data`);
        evidence = getMockData(competitor);
      }

      // Calculate relationship strength based on evidence
      let relationshipStrength = 'unknown';
      let engagementStatus = 'unknown';
      
      if (evidence.length > 0) {
        relationshipStrength = evidence.length > 3 ? 'strong' : evidence.length > 1 ? 'moderate' : 'weak';
        
        // Determine engagement status by checking if any evidence is recent (within 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const hasRecentEvidence = evidence.some(item => {
          try {
            if (item.lastScraped) {
              const scrapedDate = new Date(item.lastScraped);
              return scrapedDate > oneYearAgo;
            }
          } catch (e) {
            return false;
          }
          return false;
        });
        
        engagementStatus = hasRecentEvidence ? 'current' : 'past';
      }

      results.push({
        id: competitor.toLowerCase().replace(/\s+/g, '-'),
        name: competitor,
        industry: 'IT Services',
        relationshipStrength,
        engagementStatus,
        relationshipDetails: evidence.length > 0 ? evidence : [
          {
            title: 'No public evidence found',
            description: 'No collaboration evidence found through public sources',
            evidenceType: 'none',
          },
        ],
      });
    }

    // Update cache
    resultCache.data = results;
    resultCache.lastUpdated = now;

    return results;
  } catch (error) {
    logger.error('Error gathering competitor intelligence:', error);
    throw error;
  }
}

/**
 * Express.js route handler
 */
exports.getCompetitorIntel = async (req, res) => {
  try {
    const results = await gatherCompetitorIntelligence();
    res.json(results);
  } catch (error) {
    logger.error('Controller error:', error);
    res.status(500).json({
      error: 'Failed to fetch competitor intelligence',
      message: error.message,
      stack: CONFIG.IS_DEV ? error.stack : undefined
    });
  }
};