
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('members', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      unique:"uk_member"
    },
    account_id: {
      type: Sequelize.INTEGER.UNSIGNED
    },
    username: {
      type:Sequelize.STRING,
      unique:"uk_member"
    },
    remark: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      indexes: [{unique: true, fields: ['website_id','username']}],
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}