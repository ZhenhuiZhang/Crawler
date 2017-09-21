
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('role_admin', {
    admin_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        unique:"uk_role_admin",
        primaryKey: true
    },
    role_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      unique:"uk_role_admin",
      primaryKey: true
    }
  }, {
    indexes: [{unique: true, fields: ['admin_id','role_id']}],
    freezeTableName:true,
    timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}