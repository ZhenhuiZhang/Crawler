
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('admins', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      unique:"uk_admin"
    },
    username: {
      type:Sequelize.STRING,
      unique:"uk_admin"
    },
    type: {//注释
      type:Sequelize.ENUM('admin', 'user'),
      allowNull: true,
    },
    name: {//通讯
      type:Sequelize.STRING,
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING,
      defaultValue:"$2y$10$AHLmMGmWfyfx0xnexOmonu70pibAVe.c1pEhipuTwpOhDLKq95Ebu"
    },
    login_ip_adress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    login_time: {
      type: Sequelize.DATE,
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