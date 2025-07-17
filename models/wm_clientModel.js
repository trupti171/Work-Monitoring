const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const Client = sequelize.define("wm_clients",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        company_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        business: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        company: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        client_eml_id: {
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
        tableName: "wm_clients",
        timestamps: false,
    });


module.exports = Client;