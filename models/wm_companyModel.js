const {Sequelize}=require('sequelize');
const sequelize=require('../config/db');
const departmentModel=require('../models/wm_departmentModel');
const machineModel=require('../models/wm_machineModel');
const workOrderModel=require('../models/wm_workOrdersModel');
const trackingModel=require('../models/wm_trackingModel');
const clientModel=require('../models/wm_clientModel');

const Company = sequelize.define("wm_company",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        website: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        location_link: {
            type: Sequelize.STRING,
            allowNull: false,
        },
         about_text: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        company_logo: {
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
        tableName: "wm_company",
        timestamps: false,
    });

    Company.hasMany(departmentModel, { foreignKey: 'company_id' });
    departmentModel.belongsTo(Company, { foreignKey: 'company_id' });
    
    Company.hasMany(machineModel, { foreignKey: 'company_id' });
    machineModel.belongsTo(Company, { foreignKey: 'company_id' });

    Company.hasMany(workOrderModel, { foreignKey: 'company_id' });
    workOrderModel.belongsTo(Company, { foreignKey: 'company_id' });

    Company.hasMany(trackingModel, { foreignKey: 'company_id' });
    trackingModel.belongsTo(Company, { foreignKey: 'company_id' });

    Company.hasMany(clientModel, { foreignKey: 'company_id' });
    clientModel.belongsTo(Company, { foreignKey: 'company_id' });


    module.exports = Company;