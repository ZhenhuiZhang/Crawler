const Bank = require('../models').Bank;
const logger = require('../utils/logger').logger('bank');
const config = require('../config')

module.exports = { 
  bank:async function({page,broswer,website_id}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const LIST_INFO_SELECTOR = '#search_form > table > tbody > tr';
    const NAME_SELECTOR = 'td:nth-child(4)';
    const REMARK_SELECTOR = 'td:nth-child(5)';

    let page_url = `${config.websiteUrl}${config.bankPage}`
    await page.goto(page_url);
    logger.info(page_url)
    
    // 执行爬取
    const bank = await page.evaluate((Info, Name,Remark) => {
      // exchange_rate	
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($bankListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $name = $bankListItem.querySelector(Name);// 名称
          const $remark = $bankListItem.querySelector(Remark);// 备注
          return {
            name:$name.innerText,
            remark:$remark ? $remark.innerText : null,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    }, LIST_INFO_SELECTOR, NAME_SELECTOR,REMARK_SELECTOR);
    
    let count = 0;
    for (let index = 0,length = bank.length; index < length; index++) {
      let item = await Bank.findOne({
        where: {
          name:bank[index].name,
          website_id:website_id
        }
      });
      if(item){
        item = await Bank.update(bank[index],{
          where: {
            name:bank[index].name,
            website_id:website_id
          }
        })
      }else{
        item = await Bank.create({
          website_id:website_id,
          ...bank[index]
        })
      }
      //每50条打印一次，以防记录太多查看状态
      if((++count)%50==0){
        logger.debug(`Has Create bank:${count} row`)
      }
    }
    //打印总记录数
    logger.info("crawler bank.php finish,TOTAL:",count)
    return true;
  }
}