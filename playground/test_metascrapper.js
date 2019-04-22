const metascraper = require('metascraper')([
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
])

const got = require('got')

const targetUrl = 'https://www.youtube.com/watch?v=RHkhSZN3RHI';

(async () => {
    try {
        const { body: html, url } = await got(targetUrl);
        const metadata = await metascraper({ html, url })
        console.log(metadata)
    } catch(err){
        console.log(err.name);
    }
  })()
