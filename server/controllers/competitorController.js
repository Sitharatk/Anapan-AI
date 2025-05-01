const axios = require('axios');
const cheerio = require('cheerio');

// Enhanced Google search scraping function
async function scrapeGoogleResults(competitor) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `${competitor} site:virginmedia.com OR site:accenture.com OR site:tcs.com OR site:prnewswire.com partnership OR collaboration OR project`
    )}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const evidence = [];

    // Extract actual search results (updated CSS selectors)
    $('div.g').each((i, el) => {
      const title = $(el).find('h3').text();
      const url = $(el).find('a[href^="/url?"]').attr('href');
      const snippet = $(el).find('div[data-sncf]').text() || $(el).find('div.IsZvec').text();

      if (title && url) {
        evidence.push({
          title,
          url: url.startsWith('/url?q=') 
            ? decodeURIComponent(url.split('&')[0].replace('/url?q=', ''))
            : url,
          snippet: snippet?.substring(0, 200) + '...' || '',
          lastScraped: new Date().toISOString()
        });
      }
    });

    return evidence;
  } catch (error) {
    console.error(`Scraping error for ${competitor}:`, error.message);
    return [];
  }
}

// Main controller function
exports.getCompetitorIntel = async (req, res) => {
  const competitors = ['Accenture', 'TCS', 'Cognizant', 'Capgemini', 'IBM'];
  
  try {
    const results = await Promise.all(
      competitors.map(async (competitor) => {
        const evidence = await scrapeGoogleResults(competitor);
        return {
          id: competitor.toLowerCase().replace(/\s+/g, '-'),
          name: competitor,
          industry: 'IT Services', // Default, can be enhanced
          relationshipStrength: evidence.length > 2 ? 'strong' : evidence.length > 0 ? 'moderate' : 'weak',
          engagementStatus: evidence.length > 0 ? 'current' : 'past',
          relationshipDetails: evidence.length > 0 ? evidence : [{
            title: 'No public evidence found',
            description: 'No collaboration evidence found through public sources',
            evidenceType: 'none'
          }]
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      error: 'Failed to fetch competitor intelligence',
      message: error.message
    });
  }
};