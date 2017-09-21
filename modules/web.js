const Web = require('../models').Web;
const logger = require('../utils/logger').logger('web');
const config = require('../config')

module.exports = { 
  web:async function({page,broswer,website_id,config,transaction}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const LIST_INFO_SELECTOR = '#search_form > table > tbody > tr';
    const NAME_SELECTOR = 'td:nth-child(4)';
    const CNNAME_SELECTOR = 'td:nth-child(5)';
    const ENNAME_SELECTOR = 'td:nth-child(6)';
    const URL_SELECTOR = 'td:nth-child(7)';
    const REMARK_SELECTOR = 'td:nth-child(8)';

    let page_url =`${config.websiteUrl}${config.sitePage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    // 执行爬取
    const web = await page.evaluate((Info, Name, CNName,ENName,Url,Remark) => {
      // exchange_rate	
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($webListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $name = $webListItem.querySelector(Name);// 名称
          const $cn_name = $webListItem.querySelector(CNName);// 备注
          const $en_name = $webListItem.querySelector(ENName);// 备注
          const $url = $webListItem.querySelector(Url);// 备注
          const $remark= $webListItem.querySelector(Remark);// 备注
          return {
            name:$name.innerText,
            cn_name:$cn_name.innerText ? $cn_name.innerText : '',
            en_name:$en_name.innerText ? $en_name.innerText : '',
            url:$url.innerText ? $url.innerText : null,
            remark:$remark.innerText ? $remark.innerText : null,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    }, LIST_INFO_SELECTOR, NAME_SELECTOR,CNNAME_SELECTOR,
    ENNAME_SELECTOR,URL_SELECTOR,REMARK_SELECTOR);

    let count = 0,weblist = [];
    for (let index = 0,length = web.length; index < length; index++) {
      let item = await Web.findOne({
        where: {
          name:web[index].name,
          website_id:website_id
        }
      });
      if(item){
         await Web.update(web[index],{
          where: {
            id:item.id
          },
          transaction: transaction
        })
      }else{
        item = await Web.create({
          website_id:website_id,
          ...web[index]
        },{transaction: transaction})
      }
      weblist.push(item.dataValues)
      //每50条打印一次，以防记录太多查看状态
      if((++count)%50==0){
        logger.debug(`Has Create web:${count} row`)
      }
      //暂停一下
      await page.waitFor(config.pageStop);
    }
    //打印总记录数
    // logger.info(weblist)
    logger.info("crawler web.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return weblist;
  }
}