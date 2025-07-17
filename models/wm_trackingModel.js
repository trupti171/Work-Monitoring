const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const Tracking = sequelize.define("wm_tracking",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        company_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        wm_users_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        wm_work_orders_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        wm_machines_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        wm_dept_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        login_date_time: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.NOW,
        },
        logout_date_time: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        duration: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        duration_minutes: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        work_complete_qty: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        created_by: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "System",
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        updated_by: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "System",
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        is_deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,

        }
    },
    {
        tableName: "wm_tracking",
        timestamps: false,
    });

// Company.hasMany(plantModel, { foreignKey: 'company_id' });
// plantModel.belongsTo(Company, { foreignKey: 'company_id' });

module.exports = Tracking;