
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('clients', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    admin_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    currency_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    phone: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    relationship: {//理财天数计划,开始时间
      type:Sequelize.ENUM('up', 'next'),
      allowNull: true,
    },
    household_type: {//理财天数计划,只能理该天数内的账
      type:Sequelize.STRING,
      allowNull: true,
    },
    household_name: {//理财日期,null为每天
      type:Sequelize.STRING,
      allowNull: true,
    },
    household_num: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    remark: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account: {
      type: Sequelize.DOUBLE(15, 2),
      allowNull: true,
    },
    notification: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    is_active: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}