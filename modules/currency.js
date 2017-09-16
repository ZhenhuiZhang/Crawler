const puppeteer = require('puppeteer');
const model = require('../models');
const logger = require('../utils/logger').logger('currency');
const config = require('../config')

module.exports = { 
  currency:async function({page,broswer}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const CURRENCY_LIST_INFO_SELECTOR = '#search_form > table > tbody > tr';
    const CURRENCY_NAME_SELECTOR = 'td:nth-child(4)';
    const CURRENCY_REMARK_SELECTOR = 'td:nth-child(5)';
    const CURRENCY_RATE_SELECTOR = 'td:nth-child(6)';
    const CURRENCY_UNIT_SELECTOR = 'td:nth-child(7)';
    const CURRENCY_MAJOR_SELECTOR = 'td:nth-child(8) > center > input[type="radio';

    // const browser = await puppeteer.launch({
    //   headless: false
    // });

    // const page = await browser.newPage();
    console.log(`${config.websiteUrl}${config.currencyPage}`)
    await page.goto(`${config.websiteUrl}${config.currencyPage}`);
    
    // 执行爬取
    const currency = await page.evaluate((cInfo, cName, cRemark,cRate,cUnit,CMajor) => {
      // exchange_rate	
      return Array.prototype.slice.apply(document.querySelectorAll(cInfo))
        .map(($currencyListItem,index) => {
          if(index===0)return false
          const $name = $currencyListItem.querySelector(cName);// 名称
          const $remark = $currencyListItem.querySelector(cRemark);// 备注
          const $exchange_rate = $currencyListItem.querySelector(cRate);// 备注
          const $unit = $currencyListItem.querySelector(cUnit);// 备注
          const $major = $currencyListItem.querySelector(CMajor);// 备注
          console.log($major)
          return {
            name:$name.innerText,
            remark:$remark ? $remark.innerText : null,
            exchange_rate:$exchange_rate ? $exchange_rate.innerText : null,
            unit:$unit ? $unit.innerText : null,
            major:$major.checked ? 1 : 0,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    }, CURRENCY_LIST_INFO_SELECTOR, CURRENCY_NAME_SELECTOR,CURRENCY_REMARK_SELECTOR,
    CURRENCY_RATE_SELECTOR,CURRENCY_UNIT_SELECTOR,CURRENCY_MAJOR_SELECTOR);

      // sequelize.transaction(function (t1) {
      //   // With CLS enabled, the user will be created inside the transaction
      //   return User.create({ name: 'Alice' });
      // });
    // model.Currency.upsert({
    //   addressId:address.addressId,
    //   venueId: venue.venueId,
    //   street: address.street,
    //   zipCode: address.zipCode,
    //   venueAddressDeletedAt: null
    // })
    logger.info(currency)
    logger.info("crawler currency.php finish,TOTAL:",currency.length)
    // await page.waitFor(2*5000);
    return true;
  }
}