const puppeteer = require('puppeteer');
const config = require('../config')
const model = require('../models');

module.exports = {
  getWebsite : async function() {
    // dom element selectors
    let website = await model.Website.findOrCreate({where: {name:config.website}});
    return website; 
  }
}
