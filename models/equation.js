
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('equations', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    client_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    account_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    member_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    is_method: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    equation: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    remark: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    group_name: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    discount_type: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    discount_ratio: {
      type: Sequelize.DOUBLE(15, 2),
      allowNull: true,
    },
    effective_equation: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    backwater_ratio: {
      type: Sequelize.DOUBLE(15, 2),
      allowNull: true,
    },
    backwater_remark: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}