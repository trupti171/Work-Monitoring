const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');
const companyModel = require('./wm_companyModel');
const departmentModel = require('./wm_departmentModel');
const machineModel=require('./wm_machineModel');
const roleModel = require('./wm_roleModel');
const trackingModel=require('../models/wm_trackingModel');
const punchInOutModel=require('./wm_punch_in_outModel');

const User = sequelize.define(
    "wm_users", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    u_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 5000
    },
    job_role: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    email_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
    },
    phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    company_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    dept_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    machine_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    location: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    manager_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    user_pic: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    qr_code_path: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    user_path: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    u_password: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    qr_code_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    employe_grade_level: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    hourly_rate: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    comp_empl_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    otp_number: {
        type: Sequelize.INTEGER,
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
    },
},
    {
        tableName: "wm_users",
        timestamps: false,
    }
);

companyModel.hasMany(User, { foreignKey: 'company_id' });
User.belongsTo(companyModel, { foreignKey: 'company_id' });

departmentModel.hasMany(User, { foreignKey: 'dept_id' });
User.belongsTo(departmentModel, { foreignKey: 'dept_id' });

machineModel.hasMany(User, { foreignKey: 'machine_id' });
User.belongsTo(machineModel, { foreignKey: 'machine_id' });

roleModel.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(roleModel, { foreignKey: 'role_id' });

User.hasMany(User, { foreignKey: "manager_id" });
User.belongsTo(User, { foreignKey: "manager_id" });

User.hasMany(machineModel, { foreignKey: 'machine_admin_id' });
machineModel.belongsTo(User, { foreignKey: 'machine_admin_id' });

User.hasMany(trackingModel, { foreignKey: 'wm_users_id' });
trackingModel.belongsTo(User, { foreignKey: 'wm_users_id' });

User.hasMany(punchInOutModel, { foreignKey: 'user_id' });
punchInOutModel.belongsTo(User, { foreignKey: 'user_id' });

module.exports = User;
