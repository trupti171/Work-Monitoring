const companyModel = require('../models/wm_companyModel');
const machineModel = require('../models/wm_machineModel');
const userModel = require('../models/wm_userModel');
const workOrderModel = require('../models/wm_workOrdersModel');
const trackingModel = require('../models/wm_trackingModel');
const punchInOutModel = require('../models/wm_punch_in_outModel');
const deptModel = require('../models/wm_departmentModel')
const { Op } = require('sequelize');
const { addLogo, awsLogoAcces, updateLogo } = require('../utils/awsUtils')
const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const sequelize = require('../config/db');


// reference get all company
const getAllTracking = async (req, res) => {
    const { role_id, company_id, dept_id } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await trackingModel.findAll({ //super admin
                where: { is_active: true, is_deleted: false },
                order: [['updated_at', 'desc']],
            });
        } else if (role_id === 3000) {
            data = await trackingModel.findAll({ //company admin
                where: { company_id: company_id, is_active: true, is_deleted: false },
                order: [['updated_at', 'desc']],
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await trackingModel.findAll({
                where: { company_id: company_id, wm_dept_id: dept_id, is_active: true, is_deleted: false },
                order: [['updated_at', 'desc']],
            });
        } else if (role_id === 5000) { //employee
            data = await trackingModel.findAll({
                where: { company_id: company_id, wm_dept_id: dept_id, is_active: true, is_deleted: false },
                order: [['updated_at', 'desc']],
            });
        }
        else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        data = data.map(tracking => ({
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking?.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking?.wm_users_id)?.u_name,
            wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
            comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking?.wm_machines_id)?.m_name,
            comp_machine_id: machines.find(m => m.id === tracking?.wm_machines_id)?.comp_machine_id,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_name,
            wm_workorder_process: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_process,
            work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
            client_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.client_name,
            login_date_time: tracking.login_date_time,
            logout_date_time: tracking.logout_date_time,
            duration: tracking.duration,
            work_complete_qty: tracking.work_complete_qty,
            wm_dept_id: tracking.wm_dept_id,
            department_name: departments.find(d => d.id === tracking?.wm_dept_id)?.name,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All Tracking details",
            data: data,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getTrackingList = async (req, res, next) => {
    try {
        const { role_id } = req.user;
        let { c_id } = req.params;
        let data;
        if (role_id === 2000) {
            data = await trackingModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        } else if (role_id === 3000) {
            data = await trackingModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            data = await trackingModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        }
        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        res.status(200).json({
            error: false,
            message: 'Tracking list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const getTrackingMachineList = async (req, res, next) => {
    try {
        const { u_id } = req.params;
        let data;
        data = await trackingModel.findAll({
            where: { wm_users_id: u_id, is_active: true, is_deleted: false },
        })

        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        let noOfRecords = await data.length;
        res.status(200).json({
            error: false,
            noOfRecords: noOfRecords,
            message: 'tracking machine list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const getTrackingWorkList = async (req, res, next) => {
    try {
        const { u_id, m_id } = req.params;
        let data;
        data = await trackingModel.findAll({
            where: { wm_users_id: u_id, wm_machines_id: m_id, is_active: true, is_deleted: false },
        })

        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        let noOfRecords = await data.length;
        res.status(200).json({
            error: false,
            noOfRecords: noOfRecords,
            message: 'tracking machine list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};


// Ensure Sequelize operators are imported

const getTrackingDataBetweenDates = async (req, res, next) => {
    try {
        const { company_id, role_id, dept_id } = req.user;
        const { startDate, endDate, department_id } = req.query;

        // Check if both startDate and endDate are provided
        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            // Validate date formats
            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({ error: true, message: 'Invalid date format' });
            }

            let whereConditions = {
                created_at: {
                    [Op.and]: [
                        { [Op.gte]: parsedStartDate }, // Greater than or equal to startDate
                        { [Op.lt]: parsedEndDate } // Less than endDate
                    ],
                },
                is_active: true,
                is_deleted: false
            }

            if (role_id === 2000) {
                whereConditions;
            } else if (role_id === 3000) {

                whereConditions.company_id = company_id;

            } else if (role_id === 4000 || role_id === 6000) {

                whereConditions.company_id = company_id;
                whereConditions.wm_dept_id = dept_id;

            }
            else {
                return res.status(403).json({ error: true, message: 'Unauthorized role' });
            }

            if (department_id) {
                whereConditions.wm_dept_id = department_id;
            }
            // Fetch tracking data between the start and end dates
            let trackingData = await trackingModel.findAll({
                where: whereConditions,
                order: [['created_at', 'ASC']]
            });

            const companies = await companyModel.findAll();
            const users = await userModel.findAll();
            const machines = await machineModel.findAll();
            const workOrders = await workOrderModel.findAll();
            const departments = await deptModel.findAll();

            trackingData = trackingData.map(tracking => ({
                id: tracking.id,
                company_id: tracking.company_id,
                company_name: companies.find(c => c.id === tracking.company_id)?.name,
                wm_users_id: tracking.wm_users_id,
                wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
                wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
                hourly_rate: users.find(u => u.id === tracking.wm_users_id)?.hourly_rate,
                employe_grade_level: users.find(u => u.id === tracking.wm_users_id)?.employe_grade_level,
                location: users.find(u => u.id === tracking.wm_users_id)?.location,
                wm_machines_id: tracking.wm_machines_id,
                wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
                m_make: machines.find(m => m.id === tracking.wm_machines_id)?.m_make,
                m_model: machines.find(m => m.id === tracking.wm_machines_id)?.m_model,
                m_location: machines.find(m => m.id === tracking.wm_machines_id)?.m_location,
                m_type: machines.find(m => m.id === tracking.wm_machines_id)?.m_type,
                machine_hourly_rate: machines.find(m => m.id === tracking.wm_machines_id)?.machine_hourly_rate,
                comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
                wm_work_orders_id: tracking.wm_work_orders_id,
                wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
                wrk_process: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_process,
                total_quantity: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.total_quantity,
                job_completed_quantity: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.job_completed_quantity,
                wrk_type: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_type,
                work_task_number: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.work_task_number,
                operator_type: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.operator_type,
                client_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.client_name,
                machine_type: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.machine_type,
                login_date_time: tracking.login_date_time,
                logout_date_time: tracking.logout_date_time,
                duration: tracking.duration,
                work_complete_qty: tracking.work_complete_qty,
                wm_dept_id: tracking.wm_dept_id,
                wm_dept_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
                created_at: tracking.created_at,
                created_by: tracking.created_by,
                updated_at: tracking.updated_at,
                updated_by: tracking.updated_by,
                is_active: tracking.is_active,
                is_deleted: tracking.is_deleted
            }));

            const noOfRecords = trackingData.length;

            if (noOfRecords > 0) {
                res.status(200).json({
                    noOfRecords,
                    status: "success",
                    message: "Data fetched successfully.",
                    data: trackingData
                });
            } else {
                res.status(404).json({
                    error: true,
                    message: "No data found within the specified date range."
                });
            }
        } else {
            res.status(400).json({
                error: true,
                message: "Invalid request. Please provide both startDate and endDate."
            });
        }
    } catch (err) {
        console.error("Error:", err);
        next(err);
    }
};


// track-work-in-progress
const getTrackingProgessByEmpIdAndCompanyID = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId, dept_id } = req.user;
        const { company_id, user_id } = req.query;

        const tracking = await trackingModel.findOne({
            where: {
                wm_users_id: user_id,
                company_id: company_id,
                logout_date_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        if (!tracking) {
            return res.status(404).json({
                error: true,
                message: 'Tracking data not found'
            });
        }

        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        const result = {
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
            wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
            user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
            comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
            m_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
            comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
            work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
            login_date_time: tracking.login_date_time,
            // logout_date_time: tracking.logout_date_time,
            // duration: tracking.duration,
            work_complete_qty: tracking.work_complete_qty,
            wm_dept_id: tracking.wm_dept_id,
            wm_dept_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        };

        if (result['user_pic'] !== null) {
            result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');
        }
        if (result['m_pic'] !== null) {
            result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
        }

        if (role_id === 2000) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Tracking details based on employee Id and company Id",

                data: result
            });
        } else if (role_id === 3000 && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Tracking details based on employee Id and company Id",

                data: result
            });
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId && result.wm_dept_id === dept_id) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Tracking details based on employee Id and company Id",

                data: result
            });
        } else {
            return res.status(403).json({
                error: true,
                message: "Authorization Restricted"
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// track work progress based on userid
const getTrackingProgessByEmpId = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId, dept_id: userDeptId } = req.user;
        const { user_id, company_id } = req.query;
        console.log("req.user", req.user);

        // Fetch related data
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        // Check for the tracking record
        const tracking = await trackingModel.findOne({
            where: {
                wm_users_id: user_id,
                company_id: company_id,
                logout_date_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        let result = null;

        if (tracking) {
            // Create result object from tracking data
            result = {
                id: tracking.id,
                company_id: tracking.company_id,
                company_name: companies.find(c => c.id === tracking.company_id)?.name,
                wm_users_id: tracking.wm_users_id,
                wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
                wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
                user_comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
                user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
                wm_machines_id: tracking.wm_machines_id,
                wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
                comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
                machine_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
                wm_work_orders_id: tracking.wm_work_orders_id,
                wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
                work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
                uom: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.uom,
                login_date_time: tracking.login_date_time,
                // logout_date_time: tracking.logout_date_time,
                // duration: tracking.duration,
                work_complete_qty: tracking.work_complete_qty,
                wm_dept_id: tracking.wm_dept_id,
                department_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
                created_at: tracking.created_at,
                created_by: tracking.created_by,
                updated_at: tracking.updated_at,
                updated_by: tracking.updated_by,
                is_active: tracking.is_active,
                is_deleted: tracking.is_deleted
            };
            if (result['user_pic'] !== null) {
                result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');
            }
            if (result['m_pic'] !== null) {
                result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
            }

            if (role_id === 2000 || (role_id === 3000 && result.company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId && result.wm_dept_id === userDeptId) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on employee Id",
                    data: result
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        } else {
            // If no tracking record is found, get user details
            const user = await userModel.findByPk(user_id);
            // console.log("user_id==>", user);

            if (!user) {
                return res.status(404).json({
                    error: true,
                    message: 'User data not found'
                });
            }

            result = {
                wm_users_id: user.id,
                company_id: user.company_id,
                dept_id: user.dept_id,
                user_name: user.u_name,
                user_job_role: user.job_role,
                user_empl_id: user.comp_empl_id,
                user_pic: user.user_pic
            };
            if (result['user_pic'] !== null) {
                result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');
            }
            if (role_id === 2000 || (role_id === 3000 && result.company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId && result.dept_id === userDeptId) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on employee Id",
                    data: result
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// array format for machine_id
const getTrackingProgessByMachineId = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId, dept_id: userDeptId } = req.user;
        const { machine_id, company_id } = req.query;
        // console.log("req.user",req.user.dept_id);

        // Fetch related data
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        // Check for the tracking records
        const trackings = await trackingModel.findAll({
            where: {
                wm_machines_id: machine_id,
                company_id: company_id,
                logout_date_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        let result = [];

        if (trackings.length > 0) {
            // Create result objects from tracking data
            result = trackings.map(tracking => ({
                id: tracking.id,
                company_id: tracking.company_id,
                company_name: companies.find(c => c.id === tracking.company_id)?.name,
                wm_users_id: tracking.wm_users_id,
                wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
                wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
                user_comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
                user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
                wm_machines_id: tracking.wm_machines_id,
                wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
                comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
                machine_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
                m_type: machines.find(m => m.id === tracking.wm_machines_id)?.m_type,
                m_location: machines.find(m => m.id === tracking.wm_machines_id)?.m_location,
                m_model: machines.find(m => m.id === tracking.wm_machines_id)?.m_model,
                m_make: machines.find(m => m.id === tracking.wm_machines_id)?.m_make,
                wm_work_orders_id: tracking.wm_work_orders_id,
                wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
                work_task_number: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.work_task_number,
                login_date_time: tracking.login_date_time,
                work_complete_qty: tracking.work_complete_qty,
                wm_dept_id: tracking.wm_dept_id,
                dept_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
                created_at: tracking.created_at,
                created_by: tracking.created_by,
                updated_at: tracking.updated_at,
                updated_by: tracking.updated_by,
                is_active: tracking.is_active,
                is_deleted: tracking.is_deleted
            }));

            // Handle image URLs
            result = await Promise.all(result.map(async item => {
                if (item.user_pic !== null) {
                    item.user_pic = await awsLogoAcces(item.user_pic, 'USER');
                }
                if (item.machine_pic !== null) {
                    item.machine_pic = await awsLogoAcces(item.machine_pic, 'MACHINE');
                }
                return item;
            }));
            // console.log("result",result[0].wm_dept_id);

            if (role_id === 2000 || (role_id === 3000 && result[0].company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 || role_id === 6000) && result[0].company_id === userCompanyId && result[0].wm_dept_id === userDeptId) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on machine Id",
                    data: result
                });
            }
            else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        } else {
            // If no tracking records are found, get machine details
            const machine = await machineModel.findByPk(machine_id);

            if (!machine) {
                return res.status(404).json({
                    error: true,
                    message: 'Machine data not found'
                });
            }

            result = {
                wm_machines_id: machine.id,
                wm_users_id: machine.wm_users_id,
                company_id: machine.company_id,
                machine_name: machine.m_name,
                comp_machine_id: machine.comp_machine_id,
                m_pic: machine.m_pic,
                m_type: machine.m_type,
                m_location: machine.m_location,
                m_model: machine.m_model,
                m_make: machine.m_make,
            };

            if (result['m_pic'] !== null) {
                result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
            }

            // Authorization Check
            if (role_id === 2000 || (role_id === 3000 && result.company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 || role_id === 6000 && result.company_id === userCompanyId)) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on machine Id",
                    data: result
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// dash board in object format
// const getTrackingProgessForDashBoard = async (req, res, next) => {
//     try {
//         const { role_id, company_id: userCompanyId } = req.user;
//         const { dept_id, company_id } = req.query;

//         // Fetch related data
//         const companies = await companyModel.findAll();
//         const users = await userModel.findAll();
//         const machines = await machineModel.findAll();
//         const workOrders = await workOrderModel.findAll();
//         const departments = await deptModel.findAll();

//         // Check for the tracking record
//         const tracking = await trackingModel.findOne({
//             where: {
//                 wm_dept_id: dept_id,
//                 company_id: company_id,
//                 logout_date_time: null
//             },
//             order: [['updated_at', 'DESC']],
//         });

//         let result = null;

//         if (tracking) {
//             // Create result object from tracking data
//             result = {
//                 id: tracking.id,
//                 company_id: tracking.company_id,
//                 company_name: companies.find(c => c.id === tracking.company_id)?.name,
//                 wm_users_id: tracking.wm_users_id,
//                 wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
//                 wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
//                 user_comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
//                 user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
//                 wm_machines_id: tracking.wm_machines_id,
//                 wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
//                 comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
//                 machine_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
//                 m_type: machines.find(m => m.id === tracking.wm_machines_id)?.m_type,
//                 m_location: machines.find(m => m.id === tracking.wm_machines_id)?.m_location,
//                 m_model: machines.find(m => m.id === tracking.wm_machines_id)?.m_model,
//                 m_make: machines.find(m => m.id === tracking.wm_machines_id)?.m_make,
//                 wm_work_orders_id: tracking.wm_work_orders_id,
//                 wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
//                 work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
//                 login_date_time: tracking.login_date_time,
//                 work_complete_qty: tracking.work_complete_qty,
//                 wm_dept_id: tracking.wm_dept_id,
//                 dept_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
//                 created_at: tracking.created_at,
//                 created_by: tracking.created_by,
//                 updated_at: tracking.updated_at,
//                 updated_by: tracking.updated_by,
//                 is_active: tracking.is_active,
//                 is_deleted: tracking.is_deleted
//             };

//             if (result['user_pic'] !== null) {
//                 result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');
//             }
//             if (result['m_pic'] !== null) {
//                 result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
//             }

//             // Authorization Check
//             if (role_id === 2000 || (role_id === 3000 && result.company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 && result.company_id === userCompanyId)) {
//                 return res.status(200).json({
//                     error: false,
//                     message: "Fetching Tracking details based on machine Id",
//                     data: result
//                 });
//             } else {
//                 return res.status(403).json({
//                     error: true,
//                     message: "Authorization Restricted"
//                 });
//             }
//         } else {
//             // If no tracking record is found, get user details
//             const dept = await deptModel.findByPk(dept_id);
//             console.log("dept_id==>", dept);

//             if (!dept) {
//                 return res.status(404).json({
//                     error: true,
//                     message: 'department data not found'
//                 });
//             }

//             result = {
//                 company_id: dept.company_id,
//                 department_name: dept.name,
//                 department_address: dept.address,
//                 department_location_link: dept.location_link,
//             };

//             if (role_id === 2000 || (role_id === 3000 && result.company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 && result.company_id === userCompanyId)) {
//                 return res.status(200).json({
//                     error: false,
//                     message: "Fetching Tracking details based on department Id",
//                     data: result
//                 });
//             } else {
//                 return res.status(403).json({
//                     error: true,
//                     message: "Authorization Restricted"
//                 });
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         next(error);
//     }
// };

// dash board data in array format
const getTrackingProgessForDashBoard = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { dept_id, company_id } = req.query;

        // Fetch related data
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        // Check for the tracking records
        const trackings = await trackingModel.findAll({
            where: {
                wm_dept_id: dept_id,
                company_id: company_id,
                logout_date_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        let result = [];

        if (trackings.length > 0) {
            // Create result objects from tracking data
            result = trackings.map(tracking => ({
                id: tracking.id,
                company_id: tracking.company_id,
                company_name: companies.find(c => c.id === tracking.company_id)?.name,
                wm_users_id: tracking.wm_users_id,
                wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
                wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
                user_comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
                user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
                wm_machines_id: tracking.wm_machines_id,
                wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
                comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
                machine_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
                m_type: machines.find(m => m.id === tracking.wm_machines_id)?.m_type,
                m_location: machines.find(m => m.id === tracking.wm_machines_id)?.m_location,
                m_model: machines.find(m => m.id === tracking.wm_machines_id)?.m_model,
                m_make: machines.find(m => m.id === tracking.wm_machines_id)?.m_make,
                wm_work_orders_id: tracking.wm_work_orders_id,
                wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
                wm_workorder_process: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_process,
                work_task_number: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.work_task_number,
                login_date_time: tracking.login_date_time,
                work_complete_qty: tracking.work_complete_qty,
                wm_dept_id: tracking.wm_dept_id,
                dept_name: departments.find(d => d.id === tracking.wm_dept_id)?.name,
                created_at: tracking.created_at,
                created_by: tracking.created_by,
                updated_at: tracking.updated_at,
                updated_by: tracking.updated_by,
                is_active: tracking.is_active,
                is_deleted: tracking.is_deleted
            }));

            // Handle image URLs
            result = await Promise.all(result.map(async item => {
                if (item.user_pic !== null) {
                    item.user_pic = await awsLogoAcces(item.user_pic, 'USER');
                }
                if (item.machine_pic !== null) {
                    item.machine_pic = await awsLogoAcces(item.machine_pic, 'MACHINE');
                }
                return item;
            }));

            // Authorization Check
            if (role_id === 2000 || (role_id === 3000 && result.every(r => r.company_id === userCompanyId)) || (role_id === 4000 || role_id === 5000 || role_id === 6000 && result.every(r => r.company_id === userCompanyId))) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on machine Id",
                    data: result
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        } else {
            // If no tracking records are found, get department details
            const dept = await deptModel.findByPk(dept_id);

            if (!dept) {
                return res.status(404).json({
                    error: true,
                    message: 'Department data not found'
                });
            }

            result.push({
                company_id: dept.company_id,
                department_name: dept.name,
                department_address: dept.address,
                department_location_link: dept.location_link,
            });

            // Authorization Check
            if (role_id === 2000 || (role_id === 3000 && result[0].company_id === userCompanyId) || (role_id === 4000 || role_id === 5000 || role_id === 6000 && result[0].company_id === userCompanyId)) {
                return res.status(200).json({
                    error: false,
                    message: "Fetching Tracking details based on department Id",
                    data: result
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Authorization Restricted"
                });
            }
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// track-work-completed
const getTrackingCompletedByEmpIdAndCompanyID = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, user_id } = req.query;

        const tracking = await trackingModel.findOne({
            where: {
                wm_users_id: user_id,
                company_id: company_id,
                login_date_time: { [Op.ne]: null },
                logout_date_time: { [Op.ne]: null }
            },
            order: [['updated_at', 'DESC']],
        });

        if (!tracking) {
            return res.status(404).json({
                error: true,
                message: 'Tracking data not found'
            });
        }

        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();

        const result = {
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
            wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
            user_pic: users.find(u => u.id === tracking.wm_users_id)?.user_pic,
            comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
            comp_machine_id: machines.find(m => m.id === tracking.wm_machines_id)?.comp_machine_id,
            m_pic: machines.find(m => m.id === tracking.wm_machines_id)?.m_pic,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
            work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
            login_date_time: tracking.login_date_time,
            logout_date_time: tracking.logout_date_time,
            duration: tracking.duration,
            work_complete_qty: tracking.work_complete_qty,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        };

        if (result['user_pic'] !== null) {
            result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');
        }
        if (result['m_pic'] !== null) {
            result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
        }

        if (role_id === 2000) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on employee Id and company Id",

                data: result
            });
        } else if (role_id === 3000 && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on employee Id and company Id",

                data: result
            });
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on employee Id and company Id",

                data: result
            });
        } else {
            return res.status(403).json({
                error: true,
                message: "Authorization Restricted"
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// track machine available
const getTrackingMachineStatus = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, machine_id } = req.query;

        const tracking = await trackingModel.findOne({
            where: {
                company_id: company_id,
                wm_machines_id: machine_id,
                logout_date_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        if (!tracking) {
            return res.status(404).json({
                error: true,
                message: 'Tracking data not found'
            });
        }

        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();

        const result = {
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking.wm_users_id)?.u_name,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking.wm_machines_id)?.m_name,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking.wm_work_orders_id)?.wrk_name,
            work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
            login_date_time: tracking.login_date_time,
            logout_date_time: tracking.logout_date_time,
            duration: tracking.duration,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        };

        if (role_id === 2000) {
            return res.status(200).json({
                error: false,
                message: "machine is available",
                data: result
            });
        } else if (role_id === 3000 && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "machine is available",
                data: result
            });
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "machine is available",
                data: result
            });
        } else {
            return res.status(403).json({
                error: true,
                message: "Authorization Restricted"
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//combine work 
const getTrackingMachine = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, machine_id, user_id, work_order_id } = req.body;

        // Ensure new_user_id is provided
        if (!user_id) {
            return res.status(400).json({
                error: true,
                message: 'user_id is required.'
            });
        }

        // Find existing active tracking records for the machine
        const existingTrackings = await trackingModel.findAll({
            where: {
                company_id,
                wm_machines_id: machine_id,
                logout_date_time: null
            }
        });

        // Create a tracking record for the new user
        await trackingModel.create({
            company_id,
            wm_users_id: user_id,
            wm_work_orders_id: work_order_id,
            wm_machines_id: machine_id,
            login_date_time: new Date(),
            // logout_date_time: null,
            // Include other required fields or set defaults if necessary
        });

        const trackings = await trackingModel.findAll({
            attributes: ["company_id", "wm_work_orders_id", "wm_machines_id", "login_date_time", "logout_date_time"],
            where: {
                company_id,
                wm_machines_id: machine_id,
                logout_date_time: null
            },
            include: [{
                model: userModel,
                attributes: ['id', 'u_name'],
                required: false,
            }]
        });

        // Check user authorization
        if (role_id === 2000 || (role_id === 3000 && result.some(r => r.company_id === userCompanyId)) || (role_id === 4000 || role_id === 5000 || role_id === 6000 && result.some(r => r.company_id === userCompanyId))) {
            return res.status(200).json({
                error: false,
                message: "Machine updated successfully",
                data: trackings
            });
        } else {
            return res.status(403).json({
                error: true,
                message: "Authorization Restricted"
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//logout previous users and add new user for machine
const getTrackingNewUserMachine = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, machine_id, user_id, work_order_id } = req.query;

        // Ensure new_user_id is provided
        if (!user_id) {
            return res.status(400).json({
                error: true,
                message: 'user_id is required.'
            });
        }

        // Find existing active tracking records for the machine
        const existingTrackings = await trackingModel.findAll({
            where: {
                company_id,
                wm_machines_id: machine_id,
                logout_date_time: null
            }
        });

        // If there are existing trackings, logout these users
        if (existingTrackings.length > 0) {
            const now = new Date();

            // Calculate duration for existing trackings and update them
            await Promise.all(existingTrackings.map(async (tracking) => {
                const loginTime = new Date(tracking.login_date_time);
                const logoutTime = now;
                const durationMilliseconds = logoutTime - loginTime;

                // Convert milliseconds to hours, minutes, and seconds
                const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

                // Combine into a formatted string
                const durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;

                await trackingModel.update(
                    {
                        logout_date_time: now,
                        duration: durationFormatted // Store the formatted duration
                    },
                    { where: { id: tracking.id } }
                );
            }));
        }
        // Create a tracking record for the new user
        const newTracking = await trackingModel.create({
            company_id,
            wm_users_id: user_id,
            wm_work_orders_id: work_order_id,
            wm_machines_id: machine_id,
            login_date_time: new Date(),
            logout_date_time: null
        });

        // Fetch all active trackings including the new one
        const trackings = await trackingModel.findAll({
            attributes: [
                "company_id",
                "wm_machines_id",
                "login_date_time",
                "logout_date_time"
            ],
            where: {
                company_id,
                wm_machines_id: machine_id,
                logout_date_time: null
            },
            include: [{
                model: userModel,
                attributes: ['id', 'u_name'],
                required: false
            }]
        });

        // Check user authorization
        if (role_id === 2000 || (role_id === 3000 && result.some(r => r.company_id === userCompanyId)) || (role_id === 4000 || role_id === 5000 || role_id === 6000 && result.some(r => r.company_id === userCompanyId))) {
            return res.status(200).json({
                error: false,
                message: "Machine updated successfully",
                data: trackings
            });
        } else {
            return res.status(403).json({
                error: true,
                message: "Authorization Restricted"
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getTrackingById = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { id } = req.params;
        const tracking = await trackingModel.findOne({
            where: {
                id: id,
            }
        });
        if (!tracking) {
            res.status(404).json({
                error: true,
                message: 'Tracking not found'
            });
        }
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();

        const result = {
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking?.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking?.wm_users_id)?.u_name,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking?.wm_machines_id)?.m_name,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_name,
            login_date_time: tracking.login_date_time,
            logout_date_time: tracking.logout_date_time,
            duration: tracking.duration,
            work_complete_qty: tracking.work_complete_qty,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        };

        if (role_id === 2000) {
            res.status(200).json({
                error: false,
                message: 'Tracking details',
                data: result
            })
        } else if (role_id === 3000 && result.company_id === company_id) {
            res.status(200).json({
                error: false,
                message: 'Tracking details',
                data: result
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id) {
            // console.log("first")
            res.status(200).json({
                error: false,
                message: 'Tracking details',
                data: result
            })
        } else {
            return res.status(404).json({
                message: "Authorization Restricted",
                // data: []
            });
        }
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};


const createTracking = async (req, res, next) => {
    try {
        const {
            company_id,
            wm_users_id,
            wm_work_orders_id,
            wm_machines_id,
            login_date_time,
            logout_date_time,
            // work_complete_qty,
            wm_dept_id
        } = req.body;

        const workOrderDetails = await workOrderModel.findByPk(wm_work_orders_id);
        let durationFormatted = null;

        if (logout_date_time) {
            const loginTime = new Date(login_date_time);
            const logoutTime = new Date(logout_date_time);

            // Only calculate duration if logout_date_time is a valid date
            if (!isNaN(logoutTime.getTime())) {
                const durationMilliseconds = logoutTime - loginTime;
                const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

                // Combine into a formatted string
                durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;
            }
        }

        const work = await trackingModel.create({
            company_id,
            wm_users_id,
            wm_work_orders_id,
            wm_machines_id,
            login_date_time,
            logout_date_time,
            // work_complete_qty,
            wm_dept_id: workOrderDetails?.wm_dept_id || null,
            duration: durationFormatted
        });
        // console.log("work", work);

        res.status(201).json({
            error: false,
            message: 'Tracking details created successfully',
            data: work
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        next(error);
    }
};

const createTrackWorkStart = async (req, res, next) => {
    try {
        const {
            company_id,
            wm_users_id,
            wm_work_orders_id,
            wm_machines_id,
            login_date_time,
        } = req.body;

        const workOrderDetails = await workOrderModel.findByPk(wm_work_orders_id);
        // Step 1: Start work and create tracking entry
        const work = await trackingModel.create({
            company_id,
            wm_users_id,
            wm_work_orders_id,
            wm_machines_id,
            login_date_time,
            wm_dept_id: workOrderDetails?.wm_dept_id || null
        });

        // Step 2: Check if user already has an open punch-in record
        const existingPunchIn = await punchInOutModel.findOne({
            where: {
                user_id: wm_users_id,
                company_id: company_id,
                punch_out_time: null // Ensure the punch-out time is null to identify active punch-ins
            }
        });

        // Log the existingPunchIn for debugging
        // console.log("Existing Punch-In Record:", existingPunchIn);

        // Step 3: If no punch-in record found, create a new one
        if (!existingPunchIn) {
            await punchInOutModel.create({
                company_id,
                user_id: wm_users_id,
                punch_in_time: login_date_time,
                punch_out_time: null, // Assuming punch_out_time is not available yet
                duration_work: null, // Duration will be calculated on punch-out
            });
        } else {
            console.log("Punch-In record already exists, not creating a new one.");
        }

        // Respond with success message
        res.status(201).json({
            error: false,
            message: 'Tracking work started and punch-in record handled',
            data: work
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        next(error);
    }
};


const updateTracking = async (req, res, next) => {
    try {

        const {
            id,
            company_id,
            wm_users_id,
            wm_work_orders_id,
            wm_machines_id,
            login_date_time,
            logout_date_time,
            work_complete_qty,
            wm_dept_id
        } = req.body;

        // Find the existing record by ID
        const trackingRecord = await trackingModel.findByPk(id);

        if (!trackingRecord) {
            return res.status(404).json({ message: 'Tracking record not found' });
        }

        // Calculate the new duration
        const loginTime = new Date(login_date_time);
        const logoutTime = new Date(logout_date_time);
        const durationMilliseconds = logoutTime - loginTime;

        // Convert milliseconds to hours, minutes, and seconds
        const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

        // Convert the milliseconds to minutes of all total work timing
        const duration_Minutes = durationMilliseconds / (1000 * 60);

        // Combine into a formatted string
        const durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;

        // Update the record with new values
        trackingRecord.company_id = company_id;
        trackingRecord.wm_users_id = wm_users_id;
        trackingRecord.wm_work_orders_id = wm_work_orders_id;
        trackingRecord.wm_machines_id = wm_machines_id;
        trackingRecord.wm_dept_id = wm_dept_id;
        trackingRecord.work_complete_qty = work_complete_qty;
        trackingRecord.login_date_time = login_date_time;
        trackingRecord.logout_date_time = logout_date_time;
        trackingRecord.duration = durationFormatted;
        trackingRecord.duration_minutes = Math.floor(duration_Minutes);

        // Save the updated record
        await trackingRecord.save();

        res.status(200).json({
            error: false,
            message: 'Updated Tracking details',
            data: trackingRecord
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        next(error);
    }
};

// work stop
const updateWorkStop = async (req, res, next) => {
    try {
        const { company_id, wm_users_id, work_complete_qty } = req.body;

        const trackingRecords = await trackingModel.findAll({
            where: {
                company_id,
                wm_users_id,
                logout_date_time: null
            }
        });

        if (trackingRecords.length === 0) {
            return res.status(404).json({ message: 'No tracking records found with logout_date_time null' });
        }

        const currentTime = new Date();

        // Update each record's logout_date_time and calculate duration
        for (const record of trackingRecords) {
            if (record.login_date_time) {
                const loginTime = new Date(record.login_date_time);
                const logoutTime = currentTime;
                const durationMilliseconds = logoutTime - loginTime;

                // Convert the milliseconds to minutes of all total work timing
                const duration_Minutes = durationMilliseconds / (1000 * 60);

                // Convert milliseconds to hours, minutes, and seconds
                const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

                // Format the duration string
                const durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;

                // Update the record
                record.logout_date_time = logoutTime;
                record.duration = durationFormatted;
                record.work_complete_qty = work_complete_qty;
                record.duration_minutes = Math.floor(duration_Minutes);
                await record.save();
            }
        }
        res.status(200).json({
            error: false,
            message: 'Tracking work stop updated with duration',
            data: trackingRecords
        });
    } catch (error) {
        console.error('Error updating tracking records:', error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

// api to stop work with updating work completed qty to job completed qty
const updateWorkCompletedQuantity = async (req, res, next) => {
    try {
        const { company_id, wm_users_id, work_complete_qty, wm_machines_id, wm_work_orders_id } = req.body;
        console.log("req.body", req.body);

        const updatedRecords = await trackingModel.findOne({
            where: {
                company_id, wm_users_id, wm_machines_id, wm_work_orders_id, logout_date_time: null
            }
        })
        console.log("if record exist for all req.body data==>", updatedRecords);

        if (updatedRecords) {
            const work_order_tracking = await workOrderModel.findOne({
                where: {
                    id: updatedRecords.wm_work_orders_id
                }
            })
            // let work_complete = work_order_tracking?.job_completed_quantity * 1 + work_complete_qty;
            // work_complete = work_complete + ""
            const existingQty = parseFloat(work_order_tracking?.job_completed_quantity || 0);
            const newQty = parseFloat(work_complete_qty || 0);

            const work_complete = existingQty + newQty;
            // if((work_order_tracking?.total_quantity*1) >=work_complete_qty*1 ){
            //     return  res.status(400).json({ message: 'total quantity is already reached'
            //     })
            // }
            console.log("work_complete", work_complete);
            console.log("job completed quantity", work_order_tracking?.job_completed_quantity);


            let workOrderData = await workOrderModel.update({
                job_completed_quantity: work_complete
            }, {
                where: { id: updatedRecords.wm_work_orders_id }
            })
            let data1 = await workOrderModel.findOne({
                where: { id: updatedRecords.wm_work_orders_id }
            })
            console.log("job_completed_quantity", data1);
        }
        const trackingRecords = await trackingModel.findAll({
            where: {
                company_id,
                wm_users_id,
                logout_date_time: null
            }
        });

        if (trackingRecords.length === 0) {
            return res.status(404).json({ message: 'No tracking records found with logout_date_time null' });
        }

        const currentTime = new Date();

        // Update each record's logout_date_time and calculate duration
        for (const record of trackingRecords) {
            if (record.login_date_time) {
                const loginTime = new Date(record.login_date_time);
                const logoutTime = currentTime;
                const durationMilliseconds = logoutTime - loginTime;

                // Convert the milliseconds to minutes of all total work timing
                const duration_Minutes = durationMilliseconds / (1000 * 60);

                // Convert milliseconds to hours, minutes, and seconds
                const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
                const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

                // Format the duration string
                const durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;

                // Update the record
                record.logout_date_time = logoutTime;
                record.duration = durationFormatted;
                record.work_complete_qty = work_complete_qty;
                record.duration_minutes = Math.floor(duration_Minutes);
                await record.save();
            }
        }

        res.status(200).json({
            error: false,
            message: 'Tracking work stop updated with duration',
            updatedRecords,
            data: trackingRecords
        });
    } catch (error) {
        console.error('Error updating tracking records:', error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

// const updateWorkCompletedQuantity = async (req, res, next) => {
//     try {
//         const {
//             company_id,
//             wm_users_id,
//             work_complete_qty,
//             wm_machines_id,
//             wm_work_orders_id
//         } = req.body;

//         console.log("req.body", req.body);

//         // Step 1: Find the exact matching tracking record
//         const trackingRecords = await trackingModel.findOne({
//             where: {
//                 company_id,
//                 wm_users_id,
//                 wm_machines_id,
//                 wm_work_orders_id,
//                 logout_date_time: null
//             }
//         });

//         if (!trackingRecords) {
//             return res.status(404).json({
//                 message: 'No matching tracking record found with logout_date_time null'
//             });
//         }

//         // Step 2: Update work order job_completed_quantity
//         const workOrder = await workOrderModel.findOne({
//             where: {
//                 id: wm_work_orders_id
//             }
//         });

//         if (!workOrder) {
//             return res.status(404).json({
//                 message: 'Work order not found'
//             });
//         }

//         const existingQty = parseFloat(workOrder.job_completed_quantity || 0);
//         const newQty = parseFloat(work_complete_qty || 0);
//         const totalQty = parseFloat(workOrder.total_quantity || 0);
//         console.log("existingQty", existingQty);
//         console.log("newQty", newQty);
//         console.log("totalQty", totalQty);

//         const updatedQty = existingQty + newQty;
//         console.log("updatedQty", updatedQty);

//         // if (updatedQty > totalQty) {
//         //     return res.status(400).json({
//         //         message: 'Completed quantity exceeds total quantity'
//         //     });
//         // }

//         await workOrderModel.update(
//             { job_completed_quantity: updatedQty },
//             { where: { id: wm_work_orders_id } }
//         );
//         let workData = await workOrderModel.findAll({
//             where: {
//                 id: wm_work_orders_id
//             }
//         })
//         console.log("workData", workData);

//         // Step 3: Update the tracking record with logout and duration
//         const loginTime = new Date(trackingRecords.login_date_time);
//         const logoutTime = new Date();

//         const durationMs = logoutTime - loginTime;
//         const durationMinutes = Math.floor(durationMs / (1000 * 60));
//         const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
//         const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//         const durationSecs = Math.floor((durationMs % (1000 * 60)) / 1000);
//         const durationFormatted = `${durationHours} hours, ${durationMins} minutes, ${durationSecs} seconds`;

//         trackingRecords.logout_date_time = logoutTime;
//         trackingRecords.duration = durationFormatted;
//         trackingRecords.work_complete_qty = work_complete_qty;
//         trackingRecords.duration_minutes = durationMinutes;

//         await trackingRecords.save();

//         // Final response
//         res.status(200).json({
//             error: false,
//             message: 'Tracking work stop updated with duration',
//             data: trackingRecords
//         });

//     } catch (error) {
//         console.error('Error updating tracking records:', error);
//         next(error);
//     }
// };

const deleteTracking = async (req, res) => {
    try {
        const { id } = req.params;

        const work = await trackingModel.findOne({ where: { id } });

        if (!work) {
            return res.status(404).json({ message: "Tracking data not found" });
        }

        let Data = {
            is_active: false,
            is_deleted: true,
        }

        await trackingModel.update(
            Data,
            { where: { id } }
        );

        const TrackingUpdate = await trackingModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "Tracking data deleted",
            data: TrackingUpdate,
        });
    } catch (err) {
        console.log("error", err);
    }
};

// const createWorlTrackingPdf = async (req, res) => {
//     const { wm_work_orders_id } = req.body;
//     try {
//         const workOrder = await workOrderModel.findOne({ where: { id: wm_work_orders_id } });

//         const trackingStartRecords = await trackingModel.findOne({
//             where: { wm_work_orders_id }, order: [['created_at', 'ASC']]
//         });
//         const trackingEndRecords = await trackingModel.findOne({ where: { wm_work_orders_id }, order: [['updated_at', 'DESC']], });

//         const trackingStart = new Date(trackingStartRecords?.login_date_time);
//         const trackingEnd = new Date(trackingEndRecords?.logout_date_time);
//         // Calculate the difference in milliseconds
//         const timeDifference = trackingEnd - trackingStart;
//         // Convert milliseconds to hours
//         const totalMinutes = Math.floor(timeDifference / (1000 * 60));  // Convert to total minutes
//         const hours = Math.floor(totalMinutes / 60);  // Extract full hours
//         const minutes = totalMinutes % 60;  // Extract remaining minutes
//         const totalHrs = `${hours} hr ${minutes} minutes`;

//         let data = await trackingModel.findAll({
//             where: { wm_work_orders_id: wm_work_orders_id, is_active: true, is_deleted: false },
//             order: [['updated_at', 'ASC']],
//         });

//         const companies = await companyModel.findAll();
//         const users = await userModel.findAll();
//         const machines = await machineModel.findAll();
//         const workOrders = await workOrderModel.findAll();
//         const departments = await deptModel.findAll();

//         data = data.map(tracking => ({
//             id: tracking.id,
//             company_id: tracking.company_id,
//             company_name: companies.find(c => c.id === tracking?.company_id)?.name,
//             wm_users_id: tracking.wm_users_id,
//             wm_user_name: users.find(u => u.id === tracking?.wm_users_id)?.u_name,
//             wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
//             comp_empl_id: users.find(u => u.id === tracking.wm_users_id)?.comp_empl_id,
//             wm_machines_id: tracking.wm_machines_id,
//             wm_machine_name: machines.find(m => m.id === tracking?.wm_machines_id)?.m_name,
//             comp_machine_id: machines.find(m => m.id === tracking?.wm_machines_id)?.comp_machine_id,
//             wm_work_orders_id: tracking.wm_work_orders_id,
//             wm_workorder_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_name,
//             wm_workorder_process: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_process,
//             work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
//             client_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.client_name,
//             part_no: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.part_numb,
//             operation: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_type,
//             login_date_time: tracking.login_date_time,
//             logout_date_time: tracking.logout_date_time,
//             duration: tracking.duration,
//             duration_minutes: tracking.duration_minutes,
//             work_complete_qty: tracking.work_complete_qty,
//             wm_dept_id: tracking.wm_dept_id,
//             department_name: departments.find(d => d.id === tracking?.wm_dept_id)?.name,
//             created_at: tracking.created_at,
//             created_by: tracking.created_by,
//             updated_at: tracking.updated_at,
//             updated_by: tracking.updated_by,
//             is_active: tracking.is_active,
//             is_deleted: tracking.is_deleted
//         }));

//         // Effort by part number
//         const effortByPartNo = data.reduce((acc, curr) => {
//             const key = `${curr.part_no}-${curr.operation}`;
//             if (!acc[key]) {
//                 acc[key] = { part_no: curr.part_no, operation: curr.operation, duration_minutes: 0 };
//             }
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {});

//         const effortByPartNoArray = Object.values(effortByPartNo);

//         // Calculate total duration for effortByPartNoArray
//         const totalEffortByPartNoTime = effortByPartNoArray.reduce((total, item) => total + item.duration_minutes, 0);

//         // Effort by machine
//         const effortByMachine = data.reduce((acc, curr) => {
//             const key = `${curr.wm_machine_name}-${curr.wm_machines_id}`;
//             if (!acc[key]) {
//                 acc[key] = { wm_machine_name: curr.wm_machine_name, wm_machines_id: curr.wm_machines_id, duration_minutes: 0 };
//             }
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {});

//         const effortByMachineArray = Object.values(effortByMachine);

//         // Calculate total duration for effortByMachineArray
//         const totalEffortByMachineTime = effortByMachineArray.reduce((total, item) => total + item.duration_minutes, 0);

//         // Effort by employee
//         const effortByEmployees = data.reduce((acc, curr) => {
//             const key = `${curr.wm_user_name}-${curr.wm_user_job_role}`;
//             if (!acc[key]) {
//                 acc[key] = { wm_user_name: curr.wm_user_name, wm_user_job_role: curr.wm_user_job_role, duration_minutes: 0 };
//             }
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {});

//         const effortByEmployeesArray = Object.values(effortByEmployees);

//         // Calculate total duration for effortByEmployeesArray
//         const totalEffortByEmployeesTime = effortByEmployeesArray.reduce((total, item) => total + item.duration_minutes, 0);

//         let firtstHeaderData = {
//             logo: "https://static.wixstatic.com/media/ad57ac_8a8ca104adae4ec583f362ddbc3d3c8b~mv2_d_1486_1828_s_2.jpg/v1/fill/w_100,h_109,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Magod%20Logo%20Black.jpg",
//             header: "Work Order Tracking Report",
//         }
//         let secondHeaderData = {
//             workOrderNumber: wm_work_orders_id,
//             customerName: workOrder?.client_name,
//             quantity: workOrder?.total_quantity,
//             startTime: trackingStartRecords?.login_date_time,
//             endTime: trackingEndRecords?.logout_date_time,
//             totalHours: totalHrs
//         }

//         let afterHeaderBodyFirstData = {
//             effortByPartNoAndOperation: "Effort By Part Number And Operation",
//             effortByPartNoArray: effortByPartNoArray,//show in the tabel formate
//             effortByPartNoTotalHrs: totalEffortByPartNoTime
//         }

//         let afterHeaderBodySecondData = {
//             effortByMachine: "Effort By  Machine",
//             effortByMachineArray: effortByMachineArray,////show in the tabel formate
//             effortByMachineTotalHrs: totalEffortByMachineTime
//         }

//         let afterHeaderBodyThirdData = {
//             effortByEmployee: "Effort By Employee",
//             effortByEmployeeArray: effortByEmployeesArray,////show in the tabel formate
//             effortByEmployeeTotalHrs: totalEffortByEmployeesTime
//         }

//         res.status(200).json({
//             error: false,
//             message: "Pdf by work order id",
//             firtstHeaderData,
//             secondHeaderData,
//             afterHeaderBodyFirstData,
//             afterHeaderBodySecondData,
//             afterHeaderBodyThirdData
//         });
//     } catch (err) {
//         console.log("error", err);
//         res.status(500).json({ error: true, message: "Internal server error" });
//     }
// };
const createWorlTrackingPdf = async (req, res) => {
    const { work_order_numb } = req.body;

    try {
        const workOrder = await workOrderModel.findOne({ where: { work_order_numb } });
        const queryAsc = `
        SELECT
	  MIN(WT.Login_Date_Time) AS login_date_time,
	 MAX(WT.Logout_Date_Time) AS Logout_Date_Time
FROM
	Public.WM_Tracking WT
	INNER JOIN Public.WM_Work_Orders WO
		ON WO.ID = WT.WM_Work_Orders_ID 
WHERE
	 1 = 1
	 AND WO.Work_Order_Numb = '${work_order_numb}'
        LIMIT 1
        `;

        const trackingStartRecords = await sequelize.query(queryAsc);

        const trackingStart = new Date(trackingStartRecords[0][0].login_date_time);
        const trackingEnd = new Date(trackingStartRecords[0][0].logout_date_time);

        const timeDifference = trackingEnd - trackingStart;
        const totalMinutes = Math.floor(timeDifference / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.round(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        const totalHrs = `${hours} hr ${minutes} minutes`;

        const queryGetAllData = `
        SELECT *
        FROM public.wm_tracking WT
        WHERE wm_work_orders_id IN (
            SELECT WO.ID
            FROM public.wm_work_orders AS WO
            WHERE work_order_numb = '${work_order_numb}'
        )
        ORDER BY WT.id ASC
        `;
        let data = await sequelize.query(queryGetAllData);

        // Fetch necessary associated data for company, users, machines, etc.
        const companies = await companyModel.findAll();
        const users = await userModel.findAll();
        const machines = await machineModel.findAll();
        const workOrders = await workOrderModel.findAll();
        const departments = await deptModel.findAll();

        // Map tracking data with additional information
        data = data[0].map(tracking => ({
            id: tracking.id,
            company_id: tracking.company_id,
            company_name: companies.find(c => c.id === tracking?.company_id)?.name,
            wm_users_id: tracking.wm_users_id,
            wm_user_name: users.find(u => u.id === tracking?.wm_users_id)?.u_name,
            wm_user_job_role: users.find(u => u.id === tracking.wm_users_id)?.job_role,
            comp_empl_id: users.find(u => u.id === tracking?.wm_users_id)?.comp_empl_id,
            wm_machines_id: tracking.wm_machines_id,
            wm_machine_name: machines.find(m => m.id === tracking?.wm_machines_id)?.m_name,
            comp_machine_id: machines.find(m => m.id === tracking?.wm_machines_id)?.comp_machine_id,
            wm_work_orders_id: tracking.wm_work_orders_id,
            wm_workorder_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_name,
            wm_workorder_process: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_process,
            work_task_number: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.work_task_number,
            client_name: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.client_name,
            part_no: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.part_numb,
            operation: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_type,
            operation_description: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_process,
            job_completed_quantity: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.job_completed_quantity,
            total_quantity: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.total_quantity,
            login_date_time: tracking.login_date_time,
            logout_date_time: tracking.logout_date_time,
            duration: tracking.duration,
            duration_minutes: tracking.duration_minutes,
            work_complete_qty: tracking.work_complete_qty,
            wm_dept_id: tracking.wm_dept_id,
            department_name: departments.find(d => d.id === tracking?.wm_dept_id)?.name,
            created_at: tracking.created_at,
            created_by: tracking.created_by,
            updated_at: tracking.updated_at,
            updated_by: tracking.updated_by,
            is_active: tracking.is_active,
            is_deleted: tracking.is_deleted
        }));


        const effortByPartNoArray = Object.values(data.reduce((acc, curr) => {
            const key = `${curr.part_no}-${curr.operation}`;
            if (!acc[key]) acc[key] = { part_no: curr.part_no, operation: curr.operation, operation_description: curr.operation_description, total_quantity: curr.total_quantity, work_complete_qty: curr.job_completed_quantity || 0, duration_minutes: 0 };
            acc[key].duration_minutes += curr.duration_minutes;
            return acc;
        }, {}));
        // const effortByPartNoArray = Object.values(data.reduce((acc, curr) => {
        //     const key = `${curr.part_no}-${curr.operation}`;
        //     if (!acc[key]) acc[key] = { part_no: curr.part_no, operation: curr.operation, operation_description: curr.operation_description, total_quantity: curr.total_quantity, work_complete_qty: curr.work_complete_qty || 0, duration_minutes: 0 };
        //     acc[key].duration_minutes += curr.duration_minutes;
        //     return acc;
        // }, {}));
        console.log("effortByPartNoArray", effortByPartNoArray);

        // Sorting the array by `part_no` and `operation` in ascending order
        effortByPartNoArray.sort((a, b) => {
            if (a.part_no === b.part_no) {
                // If `part_no` is the same, sort by `operation`
                return a.operation.localeCompare(b.operation);
            }
            // Otherwise, sort by `part_no`
            return a.part_no.localeCompare(b.part_no);
        });

        const effortByMachineArray = Object.values(data.reduce((acc, curr) => {
            const key = `${curr.wm_machine_name}-${curr.wm_machines_id}`;
            if (!acc[key]) acc[key] = { wm_machine_name: curr.wm_machine_name, comp_machine_id: curr.comp_machine_id, duration_minutes: 0 };
            acc[key].duration_minutes += curr.duration_minutes;
            return acc;
        }, {}));
        effortByMachineArray.sort((a, b) => b.duration_minutes - a.duration_minutes);

        const effortByEmployeeArray = Object.values(data.reduce((acc, curr) => {
            const key = `${curr.wm_user_name}-${curr.wm_user_job_role}`;
            if (!acc[key]) acc[key] = { comp_empl_id: curr.comp_empl_id, wm_user_job_role: curr.wm_user_job_role, duration_minutes: 0 };
            acc[key].duration_minutes += curr.duration_minutes;
            return acc;
        }, {}));
        effortByEmployeeArray.sort((a, b) => b.duration_minutes - a.duration_minutes);
        const effortByPartNoTotalHrs = effortByPartNoArray.reduce((total, item) => total + item.duration_minutes, 0);
        const totalEffortByMachineTime = effortByMachineArray.reduce((total, item) => total + item.duration_minutes, 0);
        const effortByEmployeeTotalHrs = effortByEmployeeArray.reduce((total, item) => total + item.duration_minutes, 0);

        const htmlTemplate = fs.readFileSync(path.join(__dirname, '/../pdf/workTrackingTemplate.html'), 'utf8');
        const template = Handlebars.compile(htmlTemplate);
        let replace = {
            // logo: 'https://static.wixstatic.com/media/ad57ac_8a8ca104adae4ec583f362ddbc3d3c8b~mv2_d_1486_1828_s_2.jpg/v1/fill/w_100,h_109,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Magod%20Logo%20Black.jpg', // Replace with the logo URL
            logo: 'https://docs.myleads.in/companylogo/Logo+Details+(2)+1.png',
            header: 'Work Order Tracking Report',
            wm_workorder_name: workOrder.wrk_name,
            workOrderNumber: workOrder.work_order_numb,
            customerName: workOrder.client_name,
            quantity: workOrder.total_quantity,
            jobCompletedQuantity: workOrder.job_completed_quantity,
            startTime: trackingStart.toLocaleDateString('en-GB'),
            endTime: trackingEnd.toLocaleDateString('en-GB'),
            totalHours: totalHrs,
            days: days,
            effortByPartNoAndOperation: "Time Report by Operation",
            effortByPartNoArray,
            effortByPartNoTotalHrs: effortByPartNoTotalHrs,
            effortByMachine: "Machine Utilization",
            effortByMachineArray,
            effortByMachineTotalHrs: totalEffortByMachineTime,
            effortByEmployee: "Manpower Utilization",
            effortByEmployeeArray,
            effortByEmployeeTotalHrs: effortByEmployeeTotalHrs
        }
        const htmlToRender = template(replace);

        // Continue with PDF generation using `dom-to-pdf` or `jsPDF`...
        console.log(htmlToRender)
        res.send({ html: htmlToRender, effortByPartNoArray, effortByMachineArray, effortByEmployeeArray, fileName: 'work-tracking-report', logo: 'https://static.wixstatic.com/media/ad57ac_8a8ca104adae4ec583f362ddbc3d3c8b~mv2_d_1486_1828_s_2.jpg/v1/fill/w_100,h_109,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Magod%20Logo%20Black.jpg' });
        // res.status(200).json({
        //     message: "Work Order Tracking Report generated successfully",
        //     data: trackingStartRecords
        // })

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send({ message: "Failed to generate PDF." });
    }
};

// const createWorkTrackingList = async (req, res) => {
//     const { work_order_numb } = req.body;

//     try {
//         const workOrder = await workOrderModel.findOne({ where: { work_order_numb } });

//         const queryAsc = `
//         SELECT
//           MIN(WT.Login_Date_Time) AS login_date_time,
//           MAX(WT.Logout_Date_Time) AS logout_date_time
//         FROM
//           Public.WM_Tracking WT
//         INNER JOIN Public.WM_Work_Orders WO
//           ON WO.ID = WT.WM_Work_Orders_ID 
//         WHERE
//           WO.Work_Order_Numb = '${work_order_numb}'
//         LIMIT 1`;

//         const trackingStartRecords = await sequelize.query(queryAsc);

//         const trackingStart = new Date(trackingStartRecords[0][0].login_date_time);
//         const trackingEnd = new Date(trackingStartRecords[0][0].logout_date_time);

//         const queryGetAllData = `
//         SELECT *
//         FROM public.wm_tracking WT
//         WHERE wm_work_orders_id IN (
//             SELECT WO.ID
//             FROM public.wm_work_orders AS WO
//             WHERE work_order_numb = '${work_order_numb}'
//         )
//         ORDER BY WT.id ASC`;

//         let data = await sequelize.query(queryGetAllData);

//         const companies = await companyModel.findAll();
//         const users = await userModel.findAll();
//         const machines = await machineModel.findAll();
//         const workOrders = await workOrderModel.findAll();

//         data = data[0].map(tracking => ({
//             part_no: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.part_numb,
//             operation: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_type,
//             operation_description: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.wrk_process,
//             work_complete_qty: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.job_completed_quantity,
//             total_quantity: workOrders.find(w => w.id === tracking?.wm_work_orders_id)?.total_quantity,
//             duration_minutes: tracking.duration_minutes,
//             wm_machine_name: machines.find(m => m.id === tracking?.wm_machines_id)?.m_name,
//             wm_machines_id: tracking.wm_machines_id,
//             wm_users_id: tracking.wm_users_id,
//             wm_user_job_role: users.find(u => u.id === tracking?.wm_users_id)?.job_role
//         }));

//         const effortByPartNoArray = Object.values(data.reduce((acc, curr) => {
//             const key = `${curr.part_no}-${curr.operation}`;
//             if (!acc[key]) acc[key] = { part_no: curr.part_no, operation: curr.operation, operation_description: curr.operation_description, total_quantity: curr.total_quantity, work_complete_qty: curr.work_complete_qty || 0, duration_minutes: 0 };
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {}));

//         const effortByMachineArray = Object.values(data.reduce((acc, curr) => {
//             const key = `${curr.wm_machine_name}-${curr.wm_machines_id}`;
//             if (!acc[key]) acc[key] = { wm_machine_name: curr.wm_machine_name, duration_minutes: 0 };
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {}));

//         const effortByEmployeeArray = Object.values(data.reduce((acc, curr) => {
//             const key = `${curr.wm_user_name}-${curr.wm_user_job_role}`;
//             if (!acc[key]) acc[key] = { wm_users_id: curr.wm_users_id, wm_user_job_role: curr.wm_user_job_role, duration_minutes: 0 };
//             acc[key].duration_minutes += curr.duration_minutes;
//             return acc;
//         }, {}));

//         res.status(200).json({
//             message: "Effort Report",
//             effortByPartNo: effortByPartNoArray,
//             effortByMachine: effortByMachineArray,
//             effortByEmployee: effortByEmployeeArray
//         });

//     } catch (error) {
//         console.error("Error generating report:", error);
//         res.status(500).json({ message: "Failed to generate report." });
//     }
// };

module.exports = {
    getAllTracking,
    getTrackingList,
    getTrackingMachineList,
    getTrackingWorkList,
    getTrackingDataBetweenDates,
    getTrackingProgessByEmpId,
    getTrackingProgessByMachineId,
    getTrackingProgessForDashBoard,
    getTrackingProgessByEmpIdAndCompanyID,
    getTrackingCompletedByEmpIdAndCompanyID,
    getTrackingMachineStatus,
    getTrackingMachine,
    getTrackingNewUserMachine,
    getTrackingById,
    createWorlTrackingPdf,
    // createWorkTrackingList,
    createTracking,
    createTrackWorkStart,
    updateTracking,
    updateWorkStop,
    deleteTracking,
    updateWorkCompletedQuantity
}