/*
 * log4js
 */
var log4js = require("log4js");
var config = require("../config");

log4js.configure(config.log4js);

exports.logger = function(name,level){
    //log4js的输出级别6个: trace, debug, info, warn, error, fatal
    name = name || 'default';
    level = level || 'trace';
    var logger = log4js.getLogger(name);
    logger.level= level;
    return logger;
}