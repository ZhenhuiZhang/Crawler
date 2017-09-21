
const Sequelize = require('sequelize');
module.exports = function(sequelize) {
  return sequelize.define('transactions', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    website_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    date: {
      type:Sequelize.DATE,
    },
    client_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    web_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    account_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    member_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    associate_client_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    main_type: {
      type:Sequelize.ENUM('contra','adjustment','net'),
    },
    sub_type: {
      type:Sequelize.ENUM('1','2','3','4'),
      allowNull: true,
    },
    amount: {
      type: Sequelize.DOUBLE(15, 2),
      allowNull: true,
    },
    remark: {
      type:Sequelize.STRING,
      allowNull: true,
    },
    effective_amount: {
      type: Sequelize.DOUBLE(15, 2),
      allowNull: true,
    },
    extend: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    deleted_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  }, {
      indexes: [{unique: true, fields: ['website_id','name']}],
      freezeTableName:true,
      timestamps: false//关闭Sequelize的自动添加timestamp的功能
  });
}