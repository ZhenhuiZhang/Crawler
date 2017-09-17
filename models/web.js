
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('web', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      /**
       * 意思是unique这个属性可以为字符串也可以为bool型
       * 假如为bool型的true，则表示单个这个列建唯一索引
       * 假如为字符串，别的列中使用相同字符串的跟这个组成联合唯一索引，所以就实现了
       */
      unique:"uk_web"
    },
    name: {
      type:Sequelize.STRING,
      unique:"uk_web"
    },
    cn_name: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    en_name: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    url: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    remark: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      indexes: [{unique: true, fields: ['website_id','name']}],
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}