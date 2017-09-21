const puppeteer = require('puppeteer');
const _ = require('lodash');
const globalConfig = require('./config')
const modules = require('./modules');
const login = require('./modules/login');
const model = require('./models');
const logger = require('./utils/logger').logger('Main Program');

// console.log(modules)
/**
 * @param {*管理员信息，用于改变标记爬虫的状态的} info 
 * @param {*网站的id} website_id 
 * @param {*相关的配置，例如页面的地址等等} config 
 * @param {*网站登陆的用户名} username 
 * @param {*网站登陆的密码} password 
 */
async function runBet({info,website_id,config,username,password}) {
  return model.sequelize.transaction(async function (transaction) {
    // let website = await modules.website.getWebsite({transaction}),
    //     websiteId= website.id;

    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
    //监听弹窗
    page.on('dialog', async dialog => {
      logger.info('accept dislog')
      await dialog.accept();
    });

    await modules.login({browser,page,config,username,password});
    //to-do:理财天数不知道从什么时候开始,密码初始化？
    // await modules.admin.admin({browser,page,website_id:websiteId,transaction});

    // 货币
    let currencylist = await modules.currency.currency({browser,page,website_id,config,transaction});
    // 客户
    let clientlist = await modules.client.client({browser,page,website_id,config,transaction,currencylist});
    //银行
    let banklist =  await modules.bank.bank({browser,page,website_id,config,transaction});
    //网站
    let weblist = await modules.web.web({browser,page,website_id,config,transaction});
    // 账号
    let accountlist = await modules.account.account({browser,page,website_id,config,weblist,transaction});
    //会员
    let memberlist = await modules.member.member({browser,page,website_id,config,clientlist,weblist,accountlist,transaction});
    //转账
    await modules.transaction.contra({browser,page,website_id,config,clientlist,banklist,transaction});
    //调整和账目输入
    await modules.transaction.trade({browser,page,website_id,config,clientlist,weblist,accountlist,memberlist,transaction});
    // // await modules.transaction.trade({browser,page,website_id:websiteId,transaction});
    await browser.close();

  }).then(function (result) {
    logger.info(result)
    return 'success';
    // Transaction has been committed
    // result is whatever the result of the promise chain returned to the transaction callback
  }).catch(function (err) {
    logger.error(err)
    return false;
    // Transaction has been rolled back
    // err is whatever rejected the promise chain returned to the transaction callback
  });

}

async function start() {
  let info =await model.Admin_info.findAll({
      where: {
        extend:{
          $ne: null 
        }
      }
  });
  //过滤掉已成功爬虫的网站
  info = info.filter((n)=>{
    //1:未开始，2:正在执行,3:完成,4:失败
    return n.extend.status !==globalConfig['completedStatus']
  })
  //遍历要运行爬虫的管理员
  for (let index = 0,length = info.length; index < length; index++) {
      let admin = await info[index].getAdmin({}),
          extend = info[index]['extend'],
          config = globalConfig[extend['source']];
          config['websiteUrl'] = extend['url'].endsWith('/')?extend['url']:`${extend['url']}/`;
      
      //把状态改为正在进行状态
      info[index]['extend']['status'] = 1;
      await info[index].update({extend:JSON.stringify(info[index]['extend'])});
      
      //开始执行爬虫脚本
      let result = await runBet({
        info:info[index],
        config:config,
        website_id:admin.website_id,
        username:extend['username'],
        password:extend['password']
      });

      //修改爬虫的状态
      info[index]['extend'] = JSON.parse(info[index]['extend'])
      if(result==="success"){
        info[index]['extend']['status'] = globalConfig['completedStatus'];
      }else{
        info[index]['extend']['status'] = globalConfig['failedStatus'];
      }
      await info[index].update({extend:JSON.stringify(info[index]['extend'])});
  }
  process.exit();
}
start()
// run()