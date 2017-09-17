const Sequelize = require('sequelize');
const config = require('../config').db;

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

exports.sequelize = sequelize;
exports.Website = require('./website')(sequelize);
exports.Currency = require('./currency')(sequelize);
exports.Bank = require('./bank')(sequelize);
exports.Web = require('./web')(sequelize);
exports.Account = require('./account')(sequelize);
