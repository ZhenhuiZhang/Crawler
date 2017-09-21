const Client = require('../models').Client;
const Admin = require('../models').Admin;
const Roles = require('../models').Roles;
const Role_Admin = require('../models').Role_Admin;
const logger = require('../utils/logger').logger('client');
const _ = require('lodash')

module.exports = { 
  client:async function({page,broswer,website_id,config,currencylist,transaction}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DETAIL_URL_SELECTOR = 'td:nth-child(3) > a';
    const USERNAME_SELECTOR = 'td:nth-child(4)';
    const NAME_SELECTOR = 'td:nth-child(5)';
    const RELATION_SELECTOR = 'td:nth-child(6)';
    const PHONE_SELECTOR = 'td:nth-child(7)';
    const CURRENCY_SELECTOR = 'td:nth-child(8)';
    const REMARK_SELECTOR = 'td:nth-child(9)';
    const ACTIVE_SELECTOR = 'td:nth-child(10)';
    const IP_SELECTOR = 'td:nth-child(11)';
    const TIME_SELECTOR = 'td:nth-child(12)';
    //详情页面的选择器
    const ACCTTYPE_SELECTOR = '#accttype';
    const ACCTNAME_SELECTOR = '#acctname';
    const ACCTNO_SELECTOR = '#acctno';
    const BALANCE_SELECTOR = '#openbalance';
    const MEMO_SELECTOR = '#memo';

    currencylist = _.keyBy(currencylist,'name');
    let client_role = await Roles.findOne({
        where: {
          name:'normal-client',
        }
    });
    let page_url =`${config.websiteUrl}${config.clientPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    const client = await page.evaluate((Info, DetailUrl, Username,Name,Relation,Phone,Currency,Remark,Active,Ip,Time) => {
      
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($clientListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $url = $clientListItem.querySelector(DetailUrl);
          const $name = $clientListItem.querySelector(Name);
          const $username = $clientListItem.querySelector(Username);
          const $relation = $clientListItem.querySelector(Relation);
          const $phone = $clientListItem.querySelector(Phone);
          const $currency = $clientListItem.querySelector(Currency);
          const $remark = $clientListItem.querySelector(Remark);
          const $active = $clientListItem.querySelector(Active);
          const $ip = $clientListItem.querySelector(Ip);
          const $time = $clientListItem.querySelector(Time);
          return {
            url:$url.href,
            admin:{
              type:'user',
              name:$name ? $name.innerText : null,
              username:$username ? $username.innerText : null,
              login_ip_adress:$ip ? $ip.innerText : null,
              login_time:$time ? $time.innerText : null,
            },
            client:{
              relationship:$relation.innerText ? 'up' : 'next',
              phone:$phone.innerText ? $phone.innerText : null,
              currency:$currency.innerText ? $currency.innerText : null,
              remark:$remark.innerText ? $remark.innerText : null,
              is_active:$active.innerText.includes('Yes') ? 1 : 2,
            }
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    },LIST_INFO_SELECTOR, DETAIL_URL_SELECTOR,USERNAME_SELECTOR,NAME_SELECTOR,RELATION_SELECTOR,
    PHONE_SELECTOR,CURRENCY_SELECTOR,REMARK_SELECTOR,ACTIVE_SELECTOR,IP_SELECTOR,TIME_SELECTOR);
    
    logger.info(client)
    
    let count = 0,clientlist=[];
    for (let index = 0,length = client.length; index < length; index++) {
      let temData = client[index];
      // 跳转到指定页码
      await page.goto(temData.url);

      let extend = await page.evaluate((ACCTTYPE, ACCTNAME, ACCTNO,BALANCE,MEMO) => {
        let $household_type = document.querySelector(ACCTTYPE);
        let $household_name = document.querySelector(ACCTNAME);
        let $household_num = document.querySelector(ACCTNO);
        let $account = document.querySelector(BALANCE);
        let $notification = document.querySelector(MEMO);
        return {
          household_type : $household_type.value?$household_type.value : null,
          household_name : $household_name.value?$household_name.value : null,
          household_num : $household_num.value?$household_num.value : null,
          account : isNaN(Number($account.value))?0 : $account.value,
          notification : $notification.value?$notification.value : null,
        }  
      },ACCTTYPE_SELECTOR,ACCTNAME_SELECTOR,ACCTNO_SELECTOR,BALANCE_SELECTOR,MEMO_SELECTOR)
      
      temData.client = {
        ...temData.client,
        ...extend
      }

      temData['admin']['login_time'] = temData['admin']['login_time']?new Date(temData['admin']['login_time']):null;
      let currency = currencylist[temData['client']['currency']]
      temData['client']['currency_id'] = currency.id
      delete  temData['client']['currency'];
      delete  temData['url'];
      // logger.debug(temData)
      let admin = await Admin.findOne({
          where: {
            username:temData.admin.username,
            website_id:website_id
          }
      });
      if(admin){
          await Admin.update(temData.admin,{
            where: {
              id:admin.id
            },
            transaction: transaction
          })

          await Client.update(temData.client,{
            where: {
              admin_id:admin.id
            },
            transaction: transaction
          })

          await Role_Admin.findOrCreate({
            where:{
              admin_id:admin.id,
              role_id:client_role.id,
            },
            transaction: transaction
          })
      }else{
          // 新增管理员
          admin = await Admin.create({
            website_id:website_id,
            ...temData.admin
          },{transaction: transaction})

          //新增客户信息
          await Client.create({
            admin_id:admin.id,
            ...temData.client
          },{transaction: transaction})

          await Role_Admin.create({
            admin_id:admin.id,
            role_id:client_role.id,
          },{transaction: transaction})
      }
      clientlist.push(admin.dataValues)
      //每50条打印一次，以防记录太多查看状态
      if((++count)%50==0){
        logger.debug(`Has Create client:${count} row`)
      }
      //暂停一下
      await page.waitFor(config.pageStop);
    }
    
    //打印总记录数
    logger.info("crawler client.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return clientlist;
  }
}