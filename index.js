const modules = require('./modules');
const login = require('./modules/login');
const model = require('./models');
const logger = require('./utils/logger').logger('Main Program');
// console.log(modules)
// login()
// modules.login();
async function run() {
  let website = await modules.website.getWebsite();
  logger.info(`Start Crawler,From website:(${website[0].id})${website[0].name}`)
  // let {browser,page} = await modules.login();
  
  // console.log(a)
  // await modules.currency({browser,page});
  // browser.close();
}

run()