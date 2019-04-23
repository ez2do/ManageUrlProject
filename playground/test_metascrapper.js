const metascraper = require('metascraper')([
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
])

const got = require('got')

const targetUrl = 'https://www.youtube.com/?gl=VN';

(async () => {
    try {
        const response = await got(targetUrl);
        const metadata = await metascraper({ html: response.body, url: response.url })
        console.log(metadata)
    } catch(err){
        console.log(err.name);
    }
  })()
