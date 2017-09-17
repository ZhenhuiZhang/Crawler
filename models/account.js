
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('accounts', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      unique:"uk_account"
    },
    web_id: {
      type: Sequelize.INTEGER.UNSIGNED
    },
    username: {
      type:Sequelize.STRING,
      unique:"uk_account"
    },
    annotation: {//注释
      type:Sequelize.STRING,
      allowNull: true,
    },
    communication: {//通讯
      type:Sequelize.STRING,
      allowNull: true,
    },
    remark: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    name: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    commision: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    account: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    v_tag: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    w_tag: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    x_tag: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    y_tag: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    z_tag: {
      type: Sequelize.STRING,
      defaultValue: 0
    },
    is_active: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      indexes: [{unique: true, fields: ['website_id','username']}],
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}