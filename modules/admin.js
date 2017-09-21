const Admin = require('../models').Admin;
const Admin_info = require('../models').Admin_info;
const logger = require('../utils/logger').logger('admin');
const config = require('../config')
const _ = require('lodash')

module.exports = { 
  admin:async function({page,broswer,website_id,transaction}) {
    // dom element selectors#search_form > table > tbody > tr:nth-child(1)
    const SEARCH_BUTTON_SELECTOR = '#search_form > table > tbody > tr > td > input[type="submit"]';
    const LIST_INFO_SELECTOR = '#search_form > table.table_border > tbody > tr';
    const DETAIL_URL_SELECTOR = 'td:nth-child(3) > a';
    const USERNAME_SELECTOR = 'td:nth-child(4)';
    const NAME_SELECTOR = 'td:nth-child(5)';
    const IP_SELECTOR = 'td:nth-child(8)';
    const LOGIN_SELECTOR = 'td:nth-child(9)';
    //详情页面的选择器
    // const PHONE_SELECTOR = '#mobile';
    // const REMARK_SELECTOR = '#remark';
    // const NAME_SELECTOR = '#colname';
    // const COMM_SELECTOR = '#colcomm';
    // const AMOUNT_SELECTOR = '#colamount';
    // const V_SELECTOR = '#colv';
    // const W_SELECTOR = '#colw';
    // const X_SELECTOR = '#colx';
    // const Y_SELECTOR = '#coly';
    // const Z_SELECTOR = '#colz';
    // $table->string('phone');
    // $table->integer('admin_id')->comment('管理员的id');
    // $table->timestamp('permission_plan_date')->nullable()->comment('理财天数计划,开始时间');
    // $table->integer('permission_plan_day')->nullable()->comment('理财天数计划,只能理该天数内的账');
    // $table->string('operation_type')->nullable()->comment('理财日期,null为每天');
    // $table->timestamp('auth_operation_date')->nullable()->comment('特别授权，可授权操作时间operation_date');
    // $table->timestamp('auth_target_date')->nullable()->comment('特别授权，目标操作时间target_date');
    // $table->string('remark')->comment('备注')->nullable();
    // $table->enum('is_active', [1, 2])->default(1)->comment('有效，2否1是');

    weblist = _.keyBy(weblist,'name');
    weblistByCn = _.keyBy(weblist,'cn_name');
    let page_url =`${config.websiteUrl}${config.adminPage}`;
    await page.goto(page_url);
    logger.info(page_url)
    
    await page.click(SEARCH_BUTTON_SELECTOR);
    await page.waitForNavigation();
    // 执行爬取
    const admin = await page.evaluate((Info, DetailUrl, Username,Name,Ip,Login) => {
      
      return Array.prototype.slice.apply(document.querySelectorAll(Info))
        .map(($adminListItem,index) => {
          if(index===0)return false;// 过滤掉第一行
          const $url = $adminListItem.querySelector(DetailUrl);
          const $name = $adminListItem.querySelector(Name);
          const $username = $adminListItem.querySelector(Username);
          const $ip = $adminListItem.querySelector(Ip);
          const $login = $adminListItem.querySelector(Login);
          return {
            url:$url.href,
            type:'admin',
            username:$username ? $username.innerText : null,
            name:$name ? $name.innerText : null,
            login_ip_adress:$ip ? $ip.innerText : null,
            login_time:$login.innerText?new Date($login.innerText) : null,
          };
        })
        // 过滤掉第一行
        .filter(u => !!u);
    },LIST_INFO_SELECTOR, DETAIL_URL_SELECTOR,USERNAME_SELECTOR,
    NAME_SELECTOR,IP_SELECTOR,LOGIN_SELECTOR);
    logger.info(admin)
    let count = 0;
    // for (let index = 0,length = admin.length; index < length; index++) {
    //   let temData = admin[index];
    //   // 跳转到指定页码
    //   await page.goto(temData.url);
    //   let extend = await page.evaluate((CONTACT, REMARK, NAME,COMM,AMOUNT,V,W,X,Y,Z,ACTIVE) => {
    //     return {
    //       communication : document.querySelector(CONTACT).value || null,
    //       remark : document.querySelector(REMARK).value|| null,
    //       name : document.querySelector(NAME).value|| null,
    //       commision : document.querySelector(COMM).value|| null,
    //       admin : document.querySelector(AMOUNT).value|| null,
    //       v_tag : document.querySelector(V).value|| null,
    //       w_tag :document.querySelector(W).value|| null,
    //       x_tag :document.querySelector(X).value|| null,
    //       y_tag :document.querySelector(Y).value|| null,
    //       z_tag :document.querySelector(Z).value|| null,
    //     }  
    //   },CONTACT_SELECTOR,REMARK_SELECTOR,NAME_SELECTOR,COMM_SELECTOR,AMOUNT_SELECTOR,
    //   V_SELECTOR,W_SELECTOR,X_SELECTOR,Y_SELECTOR,Z_SELECTOR,ACTIVE_SELECTOR)

    //   temData = {
    //     ...temData,
    //     ...extend
    //   }
    //   let web = weblist[temData['web']] || weblistByCn[temData['web']]
    //   temData['web_id'] = web.id
    //   delete  temData['web'];
    //   delete  temData['url'];
    //   logger.debug(temData)
      // let item = await Admin.findOne({
      //   where: {
      //     username:temData.username,
      //     website_id:website_id
      //   }
      // });
      // if(item){
      //   await Admin.update(temData,{
      //     where: {
      //       username:temData.username,
      //       website_id:website_id
      //     },
      //     transaction: transaction
      //   })
      // }else{
      //   await Admin.create({
      //     website_id:website_id,
      //     ...temData
      //   },{transaction: transaction})
      // }

    // }

    //打印总记录数
    logger.info("crawler admin.php finish,TOTAL:",count)
    // await page.waitFor(2*5000);
    return true;
  }
}