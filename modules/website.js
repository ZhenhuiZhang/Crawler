const config = require('../config')
const Website = require('../models').Website;
const logger = require('../utils/logger').logger('Main Program');

module.exports = {
  getWebsite : async function() {
    // dom element selectors
    let website;
    website = await Website.findOne({where:{name:config.website}})
    if(!website){
      website = await Website.create({name:config.website})
    }
    logger.info(`Start Crawler,From website:(${website.id})${website.name}`)
    return website; 
  }
}
