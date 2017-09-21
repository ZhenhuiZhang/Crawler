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
let Admin,Admin_info;
exports.sequelize = sequelize;
exports.Roles = require('./role')(sequelize);
exports.Role_Admin = require('./role_admin')(sequelize);
exports.Website = require('./website')(sequelize);
Admin = exports.Admin = require('./admin')(sequelize);
Admin_info = exports.Admin_info = require('./admin_info')(sequelize);
exports.Client = require('./client')(sequelize);
exports.Currency = require('./currency')(sequelize);
exports.Bank = require('./bank')(sequelize);
exports.Web = require('./web')(sequelize);
exports.Account = require('./account')(sequelize);
exports.Member = require('./member')(sequelize);
exports.Equation = require('./equation')(sequelize);
exports.Transaction = require('./transaction')(sequelize);

Admin_info.belongsTo(Admin,{ foreignKey: 'admin_id' })
Admin.hasOne(Admin_info,{ foreignKey: 'admin_id' });
