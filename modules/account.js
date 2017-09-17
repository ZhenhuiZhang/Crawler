const Account = require('../models').Account;
const logger = require('../utils/logger').logger('account');
const config = require('../config')
const _ = require('lodash')

module.exports = { 
  account:async function({page,broswer,website_id,weblist}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DETAIL_URL_SELECTOR = 'td:nth-child(3) > a';
    const WEB_SELECTOR = 'td:nth-child(4)';
    const USERNAME_SELECTOR = 'td:nth-child(5)';
    const ANNOTATION_SELECTOR = 'td:nth-child(7)';
    const ACTIVE_SELECTOR = 'td:nth-child(12)';
    //详情页面的选择器
    const CONTACT_SELECTOR = '#contact';
    const REMARK_SELECTOR = '#remark';
    const NAME_SELECTOR = '#colname';
    const COMM_SELECTOR = '#colcomm';
    const AMOUNT_SELECTOR = '#colamount';
    const V_SELECTOR = '#colv';
    const W_SELECTOR = '#colw';
    const X_SELECTOR = '#colx';
    const Y_SELECTOR = '#coly';
    const Z_SELECTOR = '#colz';

    weblist = _.keyBy(weblist,'name');
    weblistByCn = _.keyBy(weblist,'cn_name');
    let page_url =`${config.websiteUrl}${config.accountPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    const account = await page.evaluate((Info, DetailUrl, Web,Username,Annotation,Active) => {
      
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($accountListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $url = $accountListItem.querySelector(DetailUrl);
          const $web = $accountListItem.querySelector(Web);
          const $username = $accountListItem.querySelector(Username);
          const $annotation = $accountListItem.querySelector(Annotation);
          const $active = $accountListItem.querySelector(Active);
          return {
            url:$url.href,
            web:$web ? $web.innerText : null,
            username:$username ? $username.innerText : null,
            annotation:$annotation ? $annotation.innerText : null,
            is_active:$active.innerText.includes('Yes') ? 1 : 2,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    },LIST_INFO_SELECTOR, DETAIL_URL_SELECTOR,WEB_SELECTOR,
    USERNAME_SELECTOR,ANNOTATION_SELECTOR,ACTIVE_SELECTOR);
    
    let count = 0;
    for (let index = 0,length = account.length; index < length; index++) {
      let temData = account[index];
      // 跳转到指定页码
      await page.goto(temData.url);
      let extend = await page.evaluate((CONTACT, REMARK, NAME,COMM,AMOUNT,V,W,X,Y,Z,ACTIVE) => {
        return {
          communication : document.querySelector(CONTACT).value || null,
          remark : document.querySelector(REMARK).value|| null,
          name : document.querySelector(NAME).value|| null,
          commision : document.querySelector(COMM).value|| null,
          account : document.querySelector(AMOUNT).value|| null,
          v_tag : document.querySelector(V).value|| null,
          w_tag :document.querySelector(W).value|| null,
          x_tag :document.querySelector(X).value|| null,
          y_tag :document.querySelector(Y).value|| null,
          z_tag :document.querySelector(Z).value|| null,
        }  
      },CONTACT_SELECTOR,REMARK_SELECTOR,NAME_SELECTOR,COMM_SELECTOR,AMOUNT_SELECTOR,
      V_SELECTOR,W_SELECTOR,X_SELECTOR,Y_SELECTOR,Z_SELECTOR,ACTIVE_SELECTOR)

      temData = {
        ...temData,
        ...extend
      }
      let web = weblist[temData['web']] || weblistByCn[temData['web']]
      temData['web_id'] = web.id
      delete  temData['web'];
      delete  temData['url'];
      logger.debug(temData)
      let item = await Account.findOne({
        where: {
          username:temData.username,
          website_id:website_id
        }
      });
      if(item){
        await Account.update(temData,{
          where: {
            username:temData.username,
            website_id:website_id
          }
        })
      }else{
        await Account.create({
          website_id:website_id,
          ...temData
        })
      }
      
      //每50条打印一次，以防记录太多查看状态
      if((++count)%50==0){
        logger.debug(`Has Create account:${count} row`)
      }
    }
    // for (let index = 0,length = account.length; index < length; index++) {
    //   let item = await Account.findOne({
    //     where: {
    //       name:account[index].name,
    //       website_id:website_id
    //     }
    //   });
    //   if(item){
    //     await Account.update(account[index],{
    //       where: {
    //         name:account[index].name,
    //         website_id:website_id
    //       }
    //     })
    //   }else{
    //     await Account.create({
    //       website_id:website_id,
    //       ...account[index]
    //     })
    //   }
      
    //   //每50条打印一次，以防记录太多查看状态
    //   if((++count)%50==0){
    //     logger.debug(`Has Create account:${count} row`)
    //   }
    // }
    //打印总记录数
    logger.info("crawler account.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return true;
  }
}