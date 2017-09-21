const Currency = require('../models').Currency;
const logger = require('../utils/logger').logger('currency');

module.exports = { 
  currency:async function({page,broswer,website_id,config,transaction}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const LIST_INFO_SELECTOR = '#search_form > table > tbody > tr';
    const NAME_SELECTOR = 'td:nth-child(4)';
    const REMARK_SELECTOR = 'td:nth-child(5)';
    const RATE_SELECTOR = 'td:nth-child(6)';
    const UNIT_SELECTOR = 'td:nth-child(7)';
    const MAJOR_SELECTOR = 'td:nth-child(8) > center > input[type="radio';

    let page_url =`${config.websiteUrl}${config.currencyPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    // 执行爬取
    const currency = await page.evaluate((Info, Name, Remark,Rate,Unit,Major) => {
      // exchange_rate	
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($currencyListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $name = $currencyListItem.querySelector(Name);// 名称
          const $remark = $currencyListItem.querySelector(Remark);// 备注
          const $exchange_rate = $currencyListItem.querySelector(Rate);// 备注
          const $unit = $currencyListItem.querySelector(Unit);// 备注
          const $major = $currencyListItem.querySelector(Major);// 备注
          return {
            name:$name.innerText,
            remark:$remark.innerText ? $remark.innerText : null,
            exchange_rate:$exchange_rate.innerText ? $exchange_rate.innerText.replace(/,/g,'') : null,
            unit:$unit.innerText ? $unit.innerText : null,
            is_major:$major.checked ? 1 : 0,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    }, LIST_INFO_SELECTOR, NAME_SELECTOR,REMARK_SELECTOR,
    RATE_SELECTOR,UNIT_SELECTOR,MAJOR_SELECTOR);

    let count = 0,currencylist = [];
    for (let index = 0,length = currency.length; index < length; index++) {
      let item = await Currency.findOne({
        where: {
          name:currency[index].name,
          website_id:website_id
        }
      });
      if(item){
        await Currency.update(currency[index],{
          where: {
            id:item.id
          },
          transaction: transaction
        })
      }else{
        item = await Currency.create({
          website_id:website_id,
          ...currency[index]
        },{transaction: transaction})
      }
      currencylist.push(item.dataValues)
      //每50条打印一次，以防记录太多查看状态
      if((++count)%50==0){
        logger.debug(`Has Create currency:${count} row`)
      }
    }
    //打印总记录数
    logger.info("crawler currency.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return currencylist;
  }
}