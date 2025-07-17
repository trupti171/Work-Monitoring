const {Sequelize}=require('sequelize');
const sequelize=require('../config/db');
const trackingModel=require('../models/wm_trackingModel');

const Machine = sequelize.define("wm_machines",
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
        dept_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        machine_admin_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        m_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        m_make: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        m_model: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        m_location: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        m_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        m_pic: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        qr_code_path: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        machine_hourly_rate: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        comp_machine_id: {
            type: Sequelize.STRING,
            allowNull: false,
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
        tableName: "wm_machines",
        timestamps: false,
    });

    Machine.hasMany(trackingModel, { foreignKey: 'company_id' });
    trackingModel.belongsTo(Machine, { foreignKey: 'company_id' });

    module.exports = Machine;