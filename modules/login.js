const puppeteer = require('puppeteer');
const config = require('../config')

module.exports = async function login({page,broswer,website_id}) {
  // dom element selectors
  const USERNAME_SELECTOR = '#uid';
  const PASSWORD_SELECTOR = '#pwd';
  const BUTTON_SELECTOR = '#loginform > div > div.content-body > input.login-button';

  await page.goto(`${config.websiteUrl}${config.loginPage}`);

  await page.click(USERNAME_SELECTOR);
  await page.type(config.username);
  
  await page.click(PASSWORD_SELECTOR);
  await page.type(config.password);
  
  await page.click(BUTTON_SELECTOR);
  
  await page.waitForNavigation();

  // await page.waitFor(2*5000);
  return true
  // browser.close();
}
