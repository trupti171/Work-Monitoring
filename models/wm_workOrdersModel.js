const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');
const trackingModel = require('../models/wm_trackingModel');

const WorkOrder = sequelize.define("wm_work_orders",
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
        client_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        wm_dept_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        wrk_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        wrk_process: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        total_quantity: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        job_completed_quantity: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        wrk_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        work_task_number: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        qr_code_path: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        operator_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        machine_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        client_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        work_order_numb: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        part_numb: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        uom: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        comp_unit_id: {
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
        tableName: "wm_work_orders",
        timestamps: false,
    });

WorkOrder.hasMany(trackingModel, { foreignKey: 'wm_work_orders_id' });
trackingModel.belongsTo(WorkOrder, { foreignKey: 'wm_work_orders_id' });


module.exports = WorkOrder;