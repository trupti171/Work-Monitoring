const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const PunchInOut = sequelize.define("wm_punch_in_out",
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
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        punch_in_time: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.NOW,
        },
        punch_out_time: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        duration_work: {
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
        tableName: "wm_punch_in_out",
        timestamps: false,
    });


module.exports = PunchInOut;