const Member = require('../models').Member;
const Equation = require('../models').Equation;
const logger = require('../utils/logger').logger('member');
const _ = require('lodash')

module.exports = { 
  member:async function({page,broswer,website_id,config,clientlist,weblist,accountlist,transaction}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DETAIL_URL_SELECTOR = 'td:nth-child(3) > a';
    const WEB_SELECTOR = 'td:nth-child(4)';
    const ACCOUNT_SELECTOR = 'td:nth-child(5)';
    const USERNAME_SELECTOR = 'td:nth-child(6)';
    const REMARK_SELECTOR = 'td:nth-child(7)';
    
    clientlist = _.keyBy(clientlist,'username');
    weblist = _.keyBy(weblist,'name');
    weblistByCn = _.keyBy(weblist,'cn_name');
    accountlist = _.groupBy(accountlist,"web_id");

    let page_url =`${config.websiteUrl}${config.memberPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    const member = await page.evaluate((Info, DetailUrl, Web,Account,Username,Remark) => {
      
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($memberListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $url = $memberListItem.querySelector(DetailUrl);
          const $web = $memberListItem.querySelector(Web);
          const $account = $memberListItem.querySelector(Account);
          const $username = $memberListItem.querySelector(Username);
          const $remark = $memberListItem.querySelector(Remark);
          return {
            url:$url.href,
            member:{
              web:$web.innerText ? $web.innerText : null,
              account:$account.innerText ? $account.innerText : null,
              username:$username.innerText ? $username.innerText : null,
              remark:$remark.innerText ? $remark.innerText : null,
            }
          };
        })
        // 过滤掉第一行
        .filter(u => {
          return !!u&&!!u.member.web&&!!u.member.account
        });
    },LIST_INFO_SELECTOR, DETAIL_URL_SELECTOR,WEB_SELECTOR,ACCOUNT_SELECTOR,USERNAME_SELECTOR,
    REMARK_SELECTOR);
    
    logger.debug(member)
    let count = 0,memberlist=[];
    for (let index = 0,length = member.length; index < length; index++) {
      
      let temData = member[index]
      let web = weblist[temData['member']['web']] || weblistByCn[temData['member']['web']]
     
      let tempAccount = _.keyBy(accountlist[web.id],'username');

      if(web&&tempAccount[temData['member']['account']]){
        
        temData['member']['account_id'] = tempAccount[temData['member']['account']].id
        delete  temData['member']['web'];
        delete  temData['member']['account'];
        
        let item = await Member.findOne({
            where: {
              account_id:temData['member']['account_id'],
              username:temData.member.username,
              website_id:website_id
            }
        });
        if(item){
            await Member.update(temData.member,{
              where: {
                id:item.id
              },
              transaction: transaction
            })
        }else{
            // 新增管理员
            item = await Member.create({
                website_id:website_id,
                ...temData.member
              },{transaction: transaction})
        }
         await handleEquation({
            page,
            url:temData.url,
            clientlist:clientlist,
            accountid:temData.member.account_id,
            memberid:item.id,
            website_id,
            transaction
        })
        memberlist.push(item.dataValues)
      }
      //每50条打印一次，以防记录太多查看状态
      if((++count)%20==0){
        logger.info(`Has Create ${count} members`)
      }
      await page.waitFor(config.pageStop);
    }
    
    //打印总记录数
    logger.info("crawler member.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return memberlist;
  }
}

async function handleEquation({page,url,website_id,clientlist,accountid,memberid,transaction}){
  //详情页面的选择器
  let LIST_SELECTOR = 'body > table > tbody > tr > td > div.content-body > table > tbody > tr';
  let CLIENT_SELECTOR = 'td:nth-child(3)';
  let EQUATION_SELECTOR = 'td:nth-child(9)';
  let REMARK_SELECTOR = 'td:nth-child(10)';
  let GNAME_SELECTOR = 'td:nth-child(11)';
  let GTYPE_SELECTOR = 'td:nth-child(12)';
  let GRATIO = 'td:nth-child(13)';
  let EFEQUATION_SELECTOR = 'td:nth-child(14)';
  let EFRATIO_SELECTOR = 'td:nth-child(15)';

  await page.goto(url);

  // 执行爬取
  let equation = await page.evaluate((Info, Client, Equation,Remark,Gname,Gtype,Gratio,Efequation,Efratio) => {
    
    return Array.prototype.slice.apply(document.querySelectorAll(Info))
      .map(($memberListItem,index) => {
        if(index===0)return false;// 过滤掉第一行
        const $client = $memberListItem.querySelector(Client);
        const $equation = $memberListItem.querySelector(Equation);
        const $remark = $memberListItem.querySelector(Remark);
        const $gname = $memberListItem.querySelector(Gname);
        const $gtype = $memberListItem.querySelector(Gtype);
        const $gratio = $memberListItem.querySelector(Gratio);
        const $efequation = $memberListItem.querySelector(Efequation);
        const $efratio = $memberListItem.querySelector(Efratio);
        return {
            client:$client.innerText ? $client.innerText : null,
            equation:$equation.innerText ? $equation.innerText : null,
            remark:$remark.innerText ? $remark.innerText : null,
            group_name:$gname.innerText ? $gname.innerText : null,
            discount_type:$gtype.innerText ? $gtype.innerText : null,
            discount_ratio:$gratio.innerText ? $gratio.innerText.replace(/,/g,'') : null,
            effective_equation:$efequation.innerText ? $efequation.innerText : null,
            backwater_ratio:$efratio.innerText ? $efratio.innerText.replace(/,/g,'') : null,
        };
      })
      // 过滤掉第一行
      .filter(u => !!u);
  },LIST_SELECTOR, CLIENT_SELECTOR,EQUATION_SELECTOR,REMARK_SELECTOR,GNAME_SELECTOR,
  GTYPE_SELECTOR,GRATIO,EFEQUATION_SELECTOR,EFRATIO_SELECTOR);

  for (let index = 0,length = equation.length; index < length; index++) {
    let temData = equation[index];
    temData['client_id'] = clientlist[temData['client']].id;
    delete temData['client'];
    
    //添加相关的方程式
    await Equation.create({
      website_id:website_id,
      account_id:accountid,
      member_id:memberid,
      ...temData
    },{transaction: transaction})
  }

  return true;
}