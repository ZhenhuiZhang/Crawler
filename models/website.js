
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('website', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
      type:Sequelize.STRING,
      unique: true,
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  }, {
      timestamps: false,//关闭Sequelize的自动添加timestamp的功能
      freezeTableName:true
  });
}