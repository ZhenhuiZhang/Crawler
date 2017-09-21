const moment = require('moment');
const Transaction = require('../models').Transaction;
const logger = require('../utils/logger').logger('transaction');
const _ = require('lodash')

module.exports = { 
  //转账记录
  contra:async function({page,broswer,website_id,config,clientlist,banklist,transaction}) {
    // dom element selectors
    const STARTDATE_SELECTOR = '#startdate';//2012-09-18
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const NEXTPAGE_SELECTOR = '#search_form > a:last-child'

    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DETAIL_URL_SELECTOR = 'td:nth-child(3) > a';
    const DATE_SELECTOR = 'td:nth-child(5)';
    const FROMCLIENT_SELECTOR = 'td:nth-child(7)';
    const TOCLIENT_SELECTOR = 'td:nth-child(8)';
    const AMOUNT_SELECTOR = 'td:nth-child(9)';
    const REMARK_SELECTOR = 'td:nth-child(10)';
    const BANK_SELECTOR = 'td:nth-child(11)';
    const COMFIRM_SELECTOR = 'td:nth-child(12)';
    const STATUS_SELECTOR = 'td:nth-child(13)';

    //详情页面的选择器
    const CBANK_SELECTOR = 'select[name="checkbank"]';
    const CDATE_SELECTOR = '#checkdate';
    const CNO_SELECTOR = '#checkno';
    const ADATE_SELECTOR = '#checkalert';
    
    clientlist = _.keyBy(clientlist,'username');
    banklist = _.keyBy(banklist,'name');

    let page_url =`${config.websiteUrl}${config.contraPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(STARTDATE_SELECTOR);
    await page.keyboard.down('Control');
    await page.press('A');
    await page.type(config.min_date_limit);
    page.keyboard.up('Control');
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    //当还有下一页的链接时就继续执行
    let nextPage ,count = 0;
    
    do{ 
        //nextPage是获取德分页最后一个a标签的内容，根据判断它的内容是否为‘>’来决定是否继续执行人物
        if(nextPage){
          //跳转到下一页并且点击查询按钮,等待页面响应
          logger.info(page_url)
          await page.goto(page_url);
          // await page.click(SEARCH_BUTTON_SELECTOR);
          // await page.waitForNavigation();
        }
        
        //获取分页的a标签
        let tempPage = await page.evaluate((sel) => {
          let a_tag = document.querySelector(sel)
          return {
            page_url:a_tag?a_tag.href:null,
            nextPage:a_tag?a_tag.innerText:null
          }
        },NEXTPAGE_SELECTOR)
        //下一页的链接，以及标签的内容
        page_url = tempPage.page_url;
        nextPage = tempPage.nextPage;
        
        let contra = await page.evaluate((Info, DetailUrl, sDate,FromClient,ToClient,Amount,Remark,Bank,Comfirm,Status) => {

          return Array.prototype.slice.apply(document.querySelectorAll(Info))
            .map(($transactionListItem,index) => {
              if(index===0)return false;// 过滤掉第一行
              const $url = $transactionListItem.querySelector(DetailUrl);
              const $date = $transactionListItem.querySelector(sDate);
              const $fromClient = $transactionListItem.querySelector(FromClient);
              const $toClient = $transactionListItem.querySelector(ToClient);
              const $amount = $transactionListItem.querySelector(Amount);
              const $remark = $transactionListItem.querySelector(Remark);
              // const $comfirm = $transactionListItem.querySelector(Comfirm);
              const $status = $transactionListItem.querySelector(Status);
              return {
                url:$url.href,
                transaction:{
                  date:$date.innerText ? $date.innerText : null,
                  fromClient:$fromClient.innerText ? $fromClient.innerText : null,
                  toClient:$toClient.innerText ? $toClient.innerText : null,
                  amount:$amount.innerText ? $amount.innerText.replace(/,/g,'') : null,
                  remark:$remark.innerText ? $remark.innerText : null,
                },
                status:checkStatus($status.innerText)
                //1,Not ready,2.Ready,3.Completed
              };
            })
            // 过滤掉第一行
            .filter(u => {
              return !!u&&(!!u.transaction.fromClient)&&!!(u.transaction.toClient)
            });

            function checkStatus(value){
              //1,Not ready,2.Ready,3.Completed
              let notready=new RegExp("Not ready",'i');
              let ready=new RegExp("Ready",'i');
              let completed=new RegExp("Completed",'i');
              if(notready.test(value)){
                return 1
              }else if(ready.test(value)){
                return 2
              }else if(completed.test(value)){
                return 3
              }
              return 1;
            }
        },LIST_INFO_SELECTOR, DETAIL_URL_SELECTOR,DATE_SELECTOR,FROMCLIENT_SELECTOR,TOCLIENT_SELECTOR,
        AMOUNT_SELECTOR,REMARK_SELECTOR,BANK_SELECTOR,COMFIRM_SELECTOR,STATUS_SELECTOR);
        
        // logger.debug(contra)
        
        for (let index = 0,length = contra.length; index < length; index++) {
          let temData = contra[index];
          // 跳转到指定页码
          await page.goto(temData.url);

          let extend = await page.evaluate((CBANK, CDATE, CNO ,ADATE) => {
            let $cheque_bank = document.querySelector(CBANK);
            let $cheque_date = document.querySelector(CDATE);
            let $cheque_no = document.querySelector(CNO);
            let $cheque_alert = document.querySelector(ADATE);
            // {"status": "1", "cheque_no": "12", "cheque_date": "", "cheque_alert": "", "cheque_bank_id": 22}
            return {
              cheque_bank_id : $cheque_bank.value ? $cheque_bank.value : null,
              cheque_date : $cheque_date.value ? $cheque_date.value : null,
              cheque_no : $cheque_no.value ? $cheque_no.value : null,
              cheque_alert : $cheque_alert.value ? $cheque_alert.value : null,
            }  
          },CBANK_SELECTOR,CDATE_SELECTOR,CNO_SELECTOR,ADATE_SELECTOR)

          temData['transaction']['extend'] = {
            status:temData['status'],
            ...extend,
          }
          
          
          temData['transaction']['client_id'] = clientlist[temData['transaction']['toClient']].id;
          temData['transaction']['associate_client_id'] = clientlist[temData['transaction']['fromClient']].id;
          temData['transaction']['date'] = new Date(temData['transaction']['date']);
          temData['transaction']['created_at'] = temData['transaction']['date'];
          temData['transaction']['extend']['cheque_date']=temData['transaction']['extend']['cheque_date']?new Date(temData['transaction']['extend']['cheque_date']):null
          temData['transaction']['extend']['cheque_alert']=temData['transaction']['extend']['cheque_alert']?new Date(temData['transaction']['extend']['cheque_alert']):null
          temData['transaction']['extend']['cheque_bank_id']=temData['transaction']['extend']['cheque_bank_id']?banklist[temData['transaction']['extend']['cheque_bank_id']].id:null

          delete temData['transaction']['fromClient'];
          delete temData['transaction']['toClient'];
          temData['transaction']['extend'] = JSON.stringify(temData['transaction']['extend'])

          let item = await Transaction.create({
                      website_id:website_id,
                      main_type:'contra',
                      ...temData.transaction
                  },{transaction: transaction})
        
          
          //每50条打印一次，以防记录太多查看状态
          if((++count)%20==0){
            logger.info(`Has Create ${count} transactions`)
          }
          await page.waitFor(config.pageStop);
        }
  
    }while(nextPage&&nextPage===">");
    
    //打印总记录数
    logger.info("crawler contra.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return true;
  },
  //调整以及账目输入记录
  trade:async function({page,broswer,website_id,config,clientlist,weblist,accountlist,memberlist,transaction}) {
    // dom element selectors
    const STARTDATE_SELECTOR = '#startdate';//2012-09-18
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const NEXTPAGE_SELECTOR = '#search_form > center > a:last-child'
    
    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DATE_SELECTOR = 'td:nth-child(3)';
    const CLIENT_SELECTOR = 'td:nth-child(4)';
    const WEB_SELECTOR = 'td:nth-child(5)';
    const ACCOUNT_SELECTOR = 'td:nth-child(6)';
    const MEMBER_SELECTOR = 'td:nth-child(7)';
    const TYPE_SELECTOR = 'td:nth-child(8)';
    const AMOUNT_SELECTOR = 'td:nth-child(9)';
    const REMARK_SELECTOR = 'td:nth-child(11)';
    const EFAMOUNT_SELECTOR = 'td:nth-child(12)';

    clientlist = _.keyBy(clientlist,'username');
    weblist = _.keyBy(weblist,'name');
    weblistByCn = _.keyBy(weblist,'cn_name');
    accountlist = _.groupBy(accountlist,"web_id");
    memberlist = _.groupBy(memberlist,"account_id");

    let page_url =`${config.websiteUrl}${config.tradePage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(STARTDATE_SELECTOR);
    await page.keyboard.down('Control');
    await page.press('A');
    await page.type(config.min_date_limit);
    page.keyboard.up('Control');
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    //当还有下一页的链接时就继续执行
    let nextPage ,count = 0;
    
    do{ 
        //nextPage是获取德分页最后一个a标签的内容，根据判断它的内容是否为‘>’来决定是否继续执行人物
        if(nextPage){
          //跳转到下一页并且点击查询按钮,等待页面响应
          logger.info(page_url)
          await page.goto(page_url);
          // await page.click(SEARCH_BUTTON_SELECTOR);
          // await page.waitForNavigation();
        }
        
        //获取分页的a标签
        let tempPage = await page.evaluate((sel) => {
          let a_tag = document.querySelector(sel)
          return {
            page_url:a_tag?a_tag.href:null,
            nextPage:a_tag?a_tag.innerText:null
          }
        },NEXTPAGE_SELECTOR)
        //下一页的链接，以及标签的内容
        page_url = tempPage.page_url;
        nextPage = tempPage.nextPage;
        
        let trade = await page.evaluate((Info, DATE, CLIENT,WEB,ACCOUNT,MEMBER,TYPE,AMOUNT,REMARK,EFAMOUNT) => {

          return Array.prototype.slice.apply(document.querySelectorAll(Info))
            .map(($transactionListItem,index) => {
              if(index===0)return false;// 过滤掉第一行
              const $date = $transactionListItem.querySelector(DATE);
              const $client = $transactionListItem.querySelector(CLIENT);
              const $web = $transactionListItem.querySelector(WEB);
              const $account = $transactionListItem.querySelector(ACCOUNT);
              const $member = $transactionListItem.querySelector(MEMBER);
              const $type = $transactionListItem.querySelector(TYPE);
              const $amount = $transactionListItem.querySelector(AMOUNT);
              const $remark = $transactionListItem.querySelector(REMARK);
              const $efamount = $transactionListItem.querySelector(EFAMOUNT);
              return {
                  date:$date.innerText ? $date.innerText : null,
                  client:$client.innerText ? $client.innerText : null,
                  web:$web.innerText ? $web.innerText : null,
                  account:$account.innerText ? $account.innerText : null,
                  member:$member.innerText ? $member.innerText : null,
                  main_type:mainType($type.innerText.split('-')[0]),
                  sub_type:subType($type.innerText.split('-')[1]),
                  amount:$amount.innerText ? $amount.innerText.replace(/,/g,'') : null,
                  remark:$remark.innerText ? $remark.innerText : null,
                  effective_amount:$efamount.innerText ? $efamount.innerText.replace(/,/g,'') : null,
              };
            })
            // 客户为空以及类型为转账的记录
            .filter(u => {
              //当u为false或者类型为转账的时候
              return !!u&&((u.main_type!=='contra')&&(u.client))
            });

            function mainType(value){
              //1,Not ready,2.Ready,3.Completed
              let net=new RegExp("Net",'i');
              let contra=new RegExp("Contra",'i');
              let adjust=new RegExp("Adj",'i');
              if(net.test(value)){
                return 'net'
              }else if(contra.test(value)){
                return 'contra'
              }else if(adjust.test(value)){
                return 'adjustment'
              }
            }

            function subType(value){
              //1,Not ready,2.Ready,3.Completed
              let win=new RegExp("Win",'i');
              let lose=new RegExp("Lose",'i');
              let receive=new RegExp("Receive",'i');
              let payment=new RegExp("Payment",'i');
              if(win.test(value)){
                return 1
              }else if(lose.test(value)){
                return 2
              }else if(receive.test(value)){
                return 3
              }else if(payment.test(value)){
                return 4
              }
              return null;
            }
        },LIST_INFO_SELECTOR, DATE_SELECTOR,CLIENT_SELECTOR,WEB_SELECTOR,ACCOUNT_SELECTOR,
        MEMBER_SELECTOR,TYPE_SELECTOR,AMOUNT_SELECTOR,REMARK_SELECTOR,EFAMOUNT_SELECTOR);
      
        // logger.debug(trade)
        
        for (let index = 0,length = trade.length; index < length; index++) {
          let temData = trade[index];

          if(!clientlist[temData['client']]){
            logger.info(clientlist);
            logger.info(temData);
          }
          temData['date'] = moment(temData['date'], "YY-MM-DD");
          temData['client_id'] = clientlist[temData['client']].id;
          temData['created_at'] = temData['date'];

          let web,account,member;
          if(temData['web']){
            web = weblist[temData['web']] || weblistByCn[temData['web']]
            temData['web_id'] = web.id;
          }

          if(temData['account']&&(temData['web']&&temData['account'].trim()!=='Other')){
            account = _.keyBy(accountlist[web.id],'username')[temData['account']];
            temData['account_id'] = account.id;
          }

          if(temData['member']){
            member = _.keyBy(memberlist[account.id],'username')[temData['member']];
            if(!member){
              logger.info('asdasd')
            }

            temData['member_id'] = member.id;
          }

          delete temData['web'];
          delete temData['account'];
          delete temData['member'];
          
          //添加账目输入的类型
          temData['extend'] = {}
          if(temData['main_type']==='net'){
            temData['extend']['net_type'] = netType(temData['remark'].trim())
          }

          temData['extend'] = JSON.stringify(temData['extend'])

          let item = await Transaction.create({
                    website_id:website_id,
                    ...temData
                },{transaction: transaction})
        
          
          //每50条打印一次，以防记录太多查看状态
          if((++count)%20==0){
            logger.info(`Has Create ${count} transactions`)
          }
        }
  
    }while(nextPage&&nextPage===">");
    
    //打印总记录数
    logger.info("crawler transactionlisting.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return true;
  }
}

function netType(value){
  //1,Not ready,2.Ready,3.Completed
  let monlyDis="每期报表折头";
  let monlyRet="每期报表返水";
  let totalRet="万字报表返水";
  if(monlyDis===value){
    return '2'
  }else if(monlyRet===value){
    return '3'
  }else if(totalRet===value){
    return '4'
  }
  return 1
}
