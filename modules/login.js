const puppeteer = require('puppeteer');

module.exports = async function login({page,broswer,config,websiteUrl,username,password}) {
  // dom element selectors
  const USERNAME_SELECTOR = '#uid';
  const PASSWORD_SELECTOR = '#pwd';
  const BUTTON_SELECTOR = '#loginform > div > div.content-body > input.login-button';

  await page.goto(`${config.websiteUrl}${config.loginPage}`);

  await page.click(USERNAME_SELECTOR);
  await page.type(username);
  
  await page.click(PASSWORD_SELECTOR);
  await page.type(password);
  
  await page.click(BUTTON_SELECTOR);
  
  await page.waitForNavigation();

  // await page.waitFor(2*5000);
  return true
  // browser.close();
}
