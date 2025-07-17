const {Sequelize}=require('sequelize');
const sequelize=require('../config/db');


const roles = sequelize.define("wm_roles", {
    role_id: {
        type: Sequelize.INTEGER,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true,
    },
    role_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    created_by: {
        type: Sequelize.STRING,
        defaultValue: "SYSTEM",
    },
    updated_by: {
        type: Sequelize.STRING,
        defaultValue: "SYSTEM",
    }
},
    {
        tableName: "wm_roles",
        timestamps: false,
    });

    

module.exports = roles;