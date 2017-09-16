const fs = require('fs')
let modules = {}
var files = fs.readdirSync(__dirname);
files.forEach(function (file) {
  //使用/目录/index.js的方式加载
  if(file.includes('.')){
      let fileName = file.split('.')[0];
      if(fileName==='index')return false;
      // console.log('scan',__dirname + '/' + file)
      modules[fileName] = require(__dirname + '/' + file);
  }
});
// console.log(files,__dirname)
// console.log(modules)
module.exports = modules;