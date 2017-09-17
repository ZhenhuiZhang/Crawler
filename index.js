const puppeteer = require('puppeteer');
const modules = require('./modules');
const login = require('./modules/login');
const model = require('./models');
const logger = require('./utils/logger').logger('Main Program');
// console.log(modules)
// login()
// modules.login();
async function run() {
  let website = await modules.website.getWebsite(),
      websiteId= website.id;

  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await modules.login({browser,page,website_id:websiteId});
  
  // await modules.currency.currency({browser,page,website_id:websiteId});
  // await modules.bank.bank({browser,page,website_id:websiteId});
  let weblist = await modules.web.web({browser,page,website_id:websiteId});
  let accountlist = await modules.account.account({browser,page,website_id:websiteId,weblist});
  browser.close();
}

run()