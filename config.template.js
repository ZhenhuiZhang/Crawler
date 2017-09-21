module.exports = {
  'completedStatus':2,//0:未开始，1:正在执行,2:完成,3:失败
  'runningStatus':1,
  'failedStatus':3,

  "bet168":{
      loginPage:'',
      adminPage:'',//管理员列表页
      clientPage:'',//客户列表页
      currencyPage:'',//货币列表页
      bankPage:'',//银行列表页
      sitePage:'',//网站列表页
      accountPage:'',//账号列表页
      memberPage:'',//会员列表页
      contraPage:'',//调整列表页
      tradePage:'',//交易记录列表页
    
      pageStop:300,//ms,控制爬虫的速度，免得页面跳转的太快
      
      min_date_limit:'2012-09-18',//搜索条件的时间限制
  },

  db :{
    database: '', // 使用哪个数据库
    username: '', // 用户名
    password: '', // 密码
    host: '', // 主机名
    port: 3306 // 端口号，MySQL默认3306
  },
  log4js:{
      appenders: {
          'cheese':{
              type: 'dateFile',                   //file，dateFile
              filename: 'logs/log',
              pattern: "_yyyy-MM-dd.log",         //日期后缀格式
              maxLogSize: 2048000,                //2M分隔
              backups:4,
              alwaysIncludePattern: true
          },
          "log":{
            type: 'console'
          },
      },
      categories: {
        default: { appenders: [ 'cheese','log' ], level: 'trace' }
      },
      replaceConsole: true
  },
};