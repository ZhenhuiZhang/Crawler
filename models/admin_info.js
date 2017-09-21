
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('admin_infos', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    admin_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    phone: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    permission_plan_date: {//理财天数计划,开始时间
      type:Sequelize.Sequelize.DATE,
      allowNull: true,
    },
    permission_plan_day: {//理财天数计划,只能理该天数内的账
      type:Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    },
    operation_type: {//理财日期,null为每天
      type: Sequelize.STRING,
      allowNull: true,
    },
    auth_operation_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    auth_target_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    remark: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    is_active: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    extend: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}