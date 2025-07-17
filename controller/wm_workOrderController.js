const companyModel = require('../models/wm_companyModel');
const workOrderModel = require('../models/wm_workOrdersModel');
const departmentModel = require('../models/wm_departmentModel')
const { addLogo, awsLogoAcces, updateLogo, generateQRCode } = require('../utils/awsUtils');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const Tracking = require('../models/wm_trackingModel');
const { Sequelize } = require('sequelize');


// reference get all company
const getAllWorkOrder = async (req, res) => {
    const { role_id, company_id, dept_id } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await workOrderModel.findAll({ //super admin
                where: { is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 3000) {
            data = await workOrderModel.findAll({ //company admin
                where: { company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await workOrderModel.findAll({
                where: { wm_dept_id: dept_id, company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: departmentModel,
                    attributes: ['name'],
                    include: [{
                        model: companyModel,
                        attributes: ['name'],
                    }]
                }]
            });
        } else if (role_id === 5000) { //employee
            data = await workOrderModel.findAll({
                where: { wm_dept_id: dept_id, company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: departmentModel,
                    attributes: ['name'],
                    include: [{
                        model: companyModel,
                        attributes: ['name'],
                    }]
                }]
            });
            // data = [data[0].wm_WorkOrder]
        }
        else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }
        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        data = data.map(work => ({
            id: work.id,
            wrk_name: work.wrk_name,
            company_id: work.company_id,
            company_name: companies.find(c => c.id === work?.company_id)?.name,
            wrk_type: work.wrk_type,
            wrk_process: work.wrk_process,
            work_task_number: work.work_task_number,
            qr_code_path: work.qr_code_path,
            total_quantity: work.total_quantity,
            job_completed_quantity: work.job_completed_quantity,
            operator_type: work.operator_type,
            machine_type: work.machine_type,
            client_name: work.client_name,
            wm_dept_id: work.wm_dept_id,
            department_name: departments.find(d => d.id === work?.wm_dept_id)?.name,
            work_order_numb: work.work_order_numb,
            part_numb: work.part_numb,
            uom: work.uom,
            created_at: work.created_at,
            created_by: work.created_by,
            updated_at: work.updated_at,
            updated_by: work.updated_by,
            is_active: work.is_active,
            is_deleted: work.is_deleted
        }));
        let updatedData = await Promise.all(data.map(async (item) => {
            // console.log("data11",item['logo']);
            if (item['qr_code_path'] !== null) {
                // console.log("item=>", item['logo'])
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');
                // console.log("s3 image=>", item['logo'])
            }
            return item; // Return the modified item
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All WorkOrder details",
            data: updatedData,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getAllWorkOrderByCIdAndWoId = async (req, res) => {
    const { role_id } = req.user;
    try {
        const { id, company_id } = req.query;

        // Validate required parameters
        if (!id || !company_id) {
            return res.status(400).json({ error: true, message: 'Missing required parameters' });
        }

        // Fetch work orders based on role_id
        let data = await workOrderModel.findAll({
            where: { id, company_id, is_active: true, is_deleted: false },
            include: [{
                model: companyModel,
                attributes: ['name'],
            }]
        });

        if (data.length === 0) {
            return res.status(404).json({ error: true, message: 'No work orders found' });
        }

        // Process data
        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        data = data.map(work => ({
            id: work.id,
            wrk_name: work.wrk_name,
            company_id: work.company_id,
            company_name: companies.find(c => c.id === work?.company_id)?.name,
            wrk_type: work.wrk_type,
            wrk_process: work.wrk_process,
            work_task_number: work.work_task_number,
            qr_code_path: work.qr_code_path,
            total_quantity: work.total_quantity,
            job_completed_quantity: work.job_completed_quantity,
            operator_type: work.operator_type,
            machine_type: work.machine_type,
            client_name: work.client_name,
            wm_dept_id: work.wm_dept_id,
            department_name: departments.find(d => d.id === work?.wm_dept_id)?.name,
            work_order_numb: work.work_order_numb,
            part_numb: work.part_numb,
            uom: work.uom,
            created_at: work.created_at,
            created_by: work.created_by,
            updated_at: work.updated_at,
            updated_by: work.updated_by,
            is_active: work.is_active,
            is_deleted: work.is_deleted
        }));
        let updatedData = await Promise.all(data.map(async (item) => {
            // console.log("data11",item['logo']);
            if (item['qr_code_path'] !== null) {
                // console.log("item=>", item['logo'])
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');
                // console.log("s3 image=>", item['logo'])
            }
            return item; // Return the modified item
        }));

        // Send response
        res.status(200).json({
            error: false,
            message: "Fetching All WorkOrder details",
            data: updatedData,
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};


const getWorkOrderList = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { c_id } = req.params;
        let data;
        if (role_id === 2000) {
            data = await workOrderModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        } else if (role_id === 3000) {
            data = await workOrderModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            data = await workOrderModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        }
        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        res.status(200).json({
            message: 'WorkOrder list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const getWorkOrderListByDeptId = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId, dept_id } = req.user;
        const { dId } = req.params;
        let data;
        // console.log("req.params",req.params,req.user.dept_id);
        // console.log("req.user",req.user);

        if (role_id === 2000) {
            data = await workOrderModel.findAll({
                where: { wm_dept_id: dId, is_active: true, is_deleted: false },
            });
        } else if (role_id === 3000) {
            data = await workOrderModel.findAll({
                where: { wm_dept_id: dId, company_id: userCompanyId, is_active: true, is_deleted: false },
            });
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            // workdata = await workOrderModel.findAll();
            // if (workdata.wm_dept_id !== dept_id) {
            //     return res.status(403).json({
            //         error: true,
            //         message: "This is not your department"
            //     });
            // }
            data = await workOrderModel.findAll({
                where: { wm_dept_id: dId, company_id: userCompanyId, is_active: true, is_deleted: false },
            });
        } else {
            // If the role doesn't match any of the above, deny access
            return res.status(403).json({
                error: true,
                message: "You do not have access to this resource",
            });
        }
        let updatedData = await Promise.all(data.map(async (item) => {
            if (item['qr_code_path'] !== null) {
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');
            }
            return item; // Return the modified item
        }));
        if (!updatedData || updatedData.length === 0) {
            return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json({
            message: 'WorkOrder list details',
            data: updatedData
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getWorkOrderByWorkOrderNumber = async (req, res) => {
    const { role_id, company_id, dept_id } = req.user;
    const { work_order_numb } = req.params;

    try {
        let data;
        const whereCondition = {
            work_order_numb: work_order_numb,
            is_active: true,
            is_deleted: false
        };

        if (role_id === 2000) {
            // Super admin: no additional filtering on company or department
            data = await workOrderModel.findAll({
                where: whereCondition,
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 3000) {
            // Company admin: filter by company_id
            data = await workOrderModel.findAll({
                where: { ...whereCondition, company_id: company_id },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 4000 || role_id === 6000) {
            // Department admin: filter by company_id and department
            data = await workOrderModel.findAll({
                where: { ...whereCondition, wm_dept_id: dept_id, company_id: company_id },
                include: [{
                    model: departmentModel,
                    attributes: ['name'],
                    include: [{
                        model: companyModel,
                        attributes: ['name'],
                    }]
                }]
            });
        } else if (role_id === 5000) {
            // Employee: filter by company_id and department
            data = await workOrderModel.findAll({
                where: { ...whereCondition, wm_dept_id: dept_id, company_id: company_id },
                include: [{
                    model: departmentModel,
                    attributes: ['name'],
                    include: [{
                        model: companyModel,
                        attributes: ['name'],
                    }]
                }]
            });
        } else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }

        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        // Map the work order data
        data = data.map(work => ({
            id: work.id,
            wrk_name: work.wrk_name,
            company_id: work.company_id,
            company_name: companies.find(c => c.id === work?.company_id)?.name,
            wrk_type: work.wrk_type,
            wrk_process: work.wrk_process,
            work_task_number: work.work_task_number,
            qr_code_path: work.qr_code_path,
            total_quantity: work.total_quantity,
            job_completed_quantity: work.job_completed_quantity,
            operator_type: work.operator_type,
            machine_type: work.machine_type,
            client_name: work.client_name,
            wm_dept_id: work.wm_dept_id,
            department_name: departments.find(d => d.id === work?.wm_dept_id)?.name,
            work_order_numb: work.work_order_numb,
            part_numb: work.part_numb,
            uom: work.uom,
            created_at: work.created_at,
            created_by: work.created_by,
            updated_at: work.updated_at,
            updated_by: work.updated_by,
            is_active: work.is_active,
            is_deleted: work.is_deleted
        }));
        let noOfRecords = data.length;

        let updatedData = await Promise.all(data.map(async (item) => {
            if (item['qr_code_path'] !== null) {
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');
            }
            return item;
        }));

        res.status(200).json({
            error: false,
            noOfRecords: noOfRecords,
            message: "Fetching WorkOrder details by work_order_numb",
            data: updatedData,
        });
    } catch (err) {
        console.log("error", err);
        res.status(500).json({ error: true, message: 'Server error' });
    }
};

const getWorkOrderByWorkOrderNumberList = async (req, res) => {

    const { role_id, company_id, dept_id } = req.user;

    try {
        let data;
        const whereCondition = {
            is_active: true,
            is_deleted: false
        };

        // Adjust filtering based on user role
        if (role_id === 2000) {
            // Super admin: no additional filtering on company or department
            data = await workOrderModel.findAll({
                where: whereCondition,
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('work_order_numb')), 'work_order_numb'],
                    'client_name'
                ]
            });
        } else if (role_id === 3000) {
            // Company admin: filter by company_id
            data = await workOrderModel.findAll({
                where: { ...whereCondition, company_id: company_id },
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('work_order_numb')), 'work_order_numb'],
                    'client_name'
                ]
            });
        } else if (role_id === 4000 || role_id === 6000) {
            // Department admin: filter by company_id and department
            data = await workOrderModel.findAll({
                where: { ...whereCondition, wm_dept_id: dept_id, company_id: company_id },
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('work_order_numb')), 'work_order_numb'],
                    'client_name'
                ]
            });
        } else if (role_id === 5000) {
            // Employee: filter by company_id and department
            data = await workOrderModel.findAll({
                where: { ...whereCondition, wm_dept_id: dept_id, company_id: company_id },
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('work_order_numb')), 'work_order_numb'],
                    'client_name'
                ]
            });
        } else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }

        // Map the result to an array
        data = data.map(work => ({
            work_order_numb: work.work_order_numb,
            client_name: work.client_name
        }));

        let noOfRecords = data.length;

        res.status(200).json({
            error: false,
            noOfRecords: noOfRecords,
            message: "Fetching distinct work orders",
            data: data,
        });
    } catch (err) {
        console.log("error", err);
        res.status(500).json({ error: true, message: 'Server error' });
    }
};


const getWorkOrderById = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { id } = req.params;
        const work = await workOrderModel.findOne({
            where: {
                id: id,
            },
            include: [{
                where: { is_deleted: false },
                model: companyModel,
                attributes: ['name'],
                required: false,
            }]
        });
        if (!work) {
            res.status(404).json({
                message: 'WorkOrder not found'
            });
        }
        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        const result = {
            id: work.id,
            wrk_name: work.wrk_name,
            company_id: work.company_id,
            company_name: companies.find(c => c.id === work?.company_id)?.name,
            wrk_type: work.wrk_type,
            wrk_process: work.wrk_process,
            work_task_number: work.work_task_number,
            qr_code_path: work.qr_code_path,
            total_quantity: work.total_quantity,
            job_completed_quantity: work.job_completed_quantity,
            operator_type: work.operator_type,
            machine_type: work.machine_type,
            client_name: work.client_name,
            wm_dept_id: work.wm_dept_id,
            department_name: departments.find(d => d.id === work?.wm_dept_id)?.name,
            work_order_numb: work.work_order_numb,
            part_numb: work.part_numb,
            uom: work.uom,
            created_at: work.created_at,
            created_by: work.created_by,
            updated_at: work.updated_at,
            updated_by: work.updated_by,
            is_active: work.is_active,
            is_deleted: work.is_deleted
        };

        if (result['qr_code_path'] !== null) {
            // console.log("item=>", item['logo'])
            result['qr_code_path'] = await awsLogoAcces(result['qr_code_path'], 'QRCODE');
            // console.log("s3 image=>", item['logo'])
            // Return the modified item
        }

        if (role_id === 2000) {
            res.status(200).json({
                message: 'WorkOrder details',
                data: result
            })
        } else if (role_id === 3000 && result.company_id === company_id) {
            res.status(200).json({
                message: 'WorkOrder details',
                data: result
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id && result.wm_dept_id === dept_id) {
            console.log("first")
            res.status(200).json({
                message: 'WorkOrder details',
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

const createWorkOrder = async (req, res, next) => {
    try {
        const {
            company_id,
            wrk_name,
            wrk_process,
            wrk_type,
            client_id,
            // work_task_number,
            job_completed_quantity,
            total_quantity,
            qr_code_path,
            operator_type,
            machine_type,
            client_name,
            wm_dept_id,
            work_order_numb,
            part_numb,
            uom,
            comp_unit_id
        } = req.body;
        // console.log("req.body",req.body);

        const work_task_number = `${comp_unit_id}_${work_order_numb}_${part_numb}_${wrk_type}`;
        // console.log("work_task_number",work_task_number);

        const work = await workOrderModel.create({
            company_id,
            wrk_name,
            wrk_process,
            wrk_type,
            client_id,
            work_task_number,
            job_completed_quantity,
            total_quantity,
            qr_code_path,
            operator_type,
            machine_type,
            client_name,
            wm_dept_id,
            work_order_numb,
            part_numb,
            uom,
            comp_unit_id
        })

        // const qrCodeKey = await generateQRCode(work);
        // const getKeyFromUrl = (qrCodeKey) => {
        //     return qrCodeKey.split('/').pop(); // Replace everything before and including '.com/'
        // };
        // // console.log("qrCodeKey",qrCodeKey);
        // const key = getKeyFromUrl(qrCodeKey);
        // work.qr_code_path = key;
        // await work.save();

        res.status(201).json({
            message: 'created WorkOrder details',
            data: work
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

        next(error);
    }
}

// const createManyWorkOrder = async (req, res, next) => {
//     try {
//         const { company_id, dept_id, name } = req.user;
//         const department = await departmentModel.findAll();
//         let { data } = req.body;

//         let successFullUploads = 0;
//         let failUploads = 0;
//         let createdRecords = [];
//         let updatedRecords = [];
//         let failedRecords = [];

//         data = data.map(ele => ({
//             company_id: company_id,
//             wrk_name: ele?.Part_Name,
//             wrk_process: ele?.Operation_Description,
//             wrk_type: ele?.Operation,
//             work_task_number: `${ele?.Unit_ID}_${ele?.Work_Order_No}_${ele?.Part_No}_${ele?.Operation}`,
//             total_quantity: ele?.Total_qty_rqd,
//             operator_type: ele?.Operator_Level,
//             machine_type: ele?.eqpt_no,
//             client_name: ele?.Customer,
//             wm_dept_id: dept_id ? dept_id : (department.find(dep => dep?.comp_unit_id === ele?.Unit_ID).id || null),
//             comp_unit_id: ele?.Unit_ID,
//             work_order_numb: ele?.Work_Order_No,
//             part_numb: ele?.Part_No,
//             client_id: ele?.client_id,
//             uom: ele?.uom,
//             job_completed_quantity: ele?.job_completed_quantity,
//             created_by: name,
//             updated_by: name,
//         }))

//         for (const workData of data) {
//             try {
//                 const existingWorkOrder = await workOrderModel.findOne({
//                     where: { work_task_number: workData.work_task_number }
//                 });

//                 if (existingWorkOrder) {
//                     // Update the existing work order
//                     const updatedData = await existingWorkOrder.update(workData);
//                     updatedRecords.push(updatedData);  // Add the new record to the array
//                     successFullUploads++;
//                 } else {
//                     workData.created_by = name;
//                     // Create a new work order
//                     const newWorkOrder = await workOrderModel.create(workData);
//                     // console.log("created new record");
//                     createdRecords.push(newWorkOrder);  // Add the new record to the array
//                     successFullUploads++;
//                 }
//             } catch (err) {
//                 failedRecords.push(workData);
//                 failUploads++;
//             }
//         }
//         const totalRecords = data.length;

//         res.status(201).json({
//             error: false,
//             message: 'created WorkOrder details',
//             totalRecords,
//             successFullUploads,
//             failUploads,
//             createdRecords,  // New records
//             updatedRecords,  // Updated records
//             failedRecords    // Failed records      
//         })
//     } catch (error) {
//         console.error(error);
//         next(error);
//     }
// }

const createManyWorkOrder = async (req, res, next) => {
    try {
        const { company_id, dept_id, name } = req.user;
        const department = await departmentModel.findAll();
        let { data } = req.body;

        let successFullUploads = 0;
        let failUploads = 0;
        let createdRecords = [];
        let updatedRecords = [];
        let failedRecords = [];

        data = data.map(ele => ({
            company_id: company_id,
            wrk_name: ele?.Part_Name,
            wrk_process: ele?.Operation_Description,
            wrk_type: ele?.Operation,
            work_task_number: `${ele?.Unit_ID}_${ele?.Work_Order_No}_${ele?.Part_No}_${ele?.Operation}`,
            total_quantity: ele?.Total_qty_rqd,
            operator_type: ele?.Operator_Level,
            machine_type: ele?.eqpt_no,
            client_name: ele?.Customer,
            wm_dept_id: dept_id ? dept_id : (department.find(dep => dep?.comp_unit_id === ele?.Unit_ID).id || null),
            comp_unit_id: ele?.Unit_ID,
            work_order_numb: ele?.Work_Order_No,
            part_numb: ele?.Part_No,
            client_id: ele?.client_id,
            uom: ele?.uom,
            job_completed_quantity: ele?.job_completed_quantity,
            created_by: name,
            updated_by: name,
        }))

        for (const workData of data) {
            let errorInRecord = false;
            let recordErrors = { ...workData }; // Create a copy of the current device data to modify for errors
            try {
                // // Validate fiels
                if (workData && !workData?.wrk_name && workData?.wrk_name) {
                    recordErrors.wrk_name = `${workData.wrk_name} (Enter the work name it is not present in the records, kindly check it.)`;
                    errorInRecord = true;
                }
                if (workData && !workData?.comp_unit_id && workData?.comp_unit_id === '') {
                    recordErrors.comp_unit_id = `${workData.comp_unit_id} (Enter the company unit id it is not present in the records, kindly check it.)`;
                    errorInRecord = true;
                }
                if (workData && !workData?.work_order_numb && workData?.work_order_numb === '') {
                    recordErrors.work_order_numb = `${workData.work_order_numb} (Enter the work order number it is not present in the records, kindly check it.)`;
                    errorInRecord = true;
                }
                if (workData && !workData?.part_numb && workData?.part_numb === '') {
                    recordErrors.part_numb = `${workData.part_numb} (Enter the part number it is not present in the records, kindly check it.)`;
                    errorInRecord = true;
                }
                if (workData && !workData?.wrk_type && workData?.wrk_type === '') {
                    recordErrors.wrk_type = `${workData.wrk_type} (Enter the work type it is not present in the records, kindly check it.)`;
                    errorInRecord = true;
                }

                const existingWorkOrder = await workOrderModel.findOne({
                    where: { work_task_number: workData.work_task_number }
                });

                if (!existingWorkOrder && !errorInRecord) {
                    workData.created_by = name;
                    // Create a new work order
                    const newWorkOrder = await workOrderModel.create(workData);
                    // console.log("created new record");
                    createdRecords.push(newWorkOrder);  // Add the new record to the array
                    successFullUploads++;

                } else if (existingWorkOrder) {
                    // Update the existing work order
                    // const updatedData = await existingWorkOrder.update(workData);
                    // updatedRecords.push(updatedData);  // Add the new record to the array
                    // successFullUploads++;
                    recordErrors.work_task_number = `${workData.work_task_number} (this work task number already present over here kindly do not repeat)`;
                    errorInRecord = true;
                }
                // Push to failedRecords if there was an error in the record
                if (errorInRecord) {
                    failedRecords.push(recordErrors);
                    failUploads++;
                }
            } catch (err) {
                recordErrors.wrk_name = `${workData.wrk_name} (Error: ${err.message})`;
                failedRecords.push(recordErrors);
                failUploads++;
            }
        }
        const totalRecords = data.length;

        res.status(201).json({
            error: false,
            message: 'created WorkOrder details',
            totalRecords,
            successFullUploads,
            failUploads,
            createdRecords,  // New records
            // updatedRecords,  // Updated records
            failedRecords    // Failed records      
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
}

const updateWorkOrder = async (req, res, next) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const { id,
            company_id,
            wrk_name,
            wrk_process,
            wrk_type,
            client_id,
            work_task_number,
            job_completed_quantity,
            total_quantity,
            operator_type,
            machine_type,
            client_name,
            wm_dept_id,
            work_order_numb,
            part_numb,
            uom,
            is_active } = jsonData;
        const qrCodeImage = req.files ? req.files.qrcode_img : null;

        const work = await workOrderModel.findOne({ where: { id: id } });
        // console.log("old logo", machine.m_pic);
        if (work) {
            let qr_code_path;
            if (qrCodeImage) {
                const qrCodeImageData = await updateLogo(work.qr_code_path, qrCodeImage[0], 'QRCODE');
                qr_code_path = qrCodeImageData.Key;
            }
            await sequelize.transaction(async (transaction) => {

                const work = await workOrderModel.update({
                    company_id,
                    wrk_name,
                    wrk_process,
                    wrk_type,
                    client_id,
                    work_task_number,
                    job_completed_quantity,
                    total_quantity,
                    qr_code_path,
                    operator_type,
                    machine_type,
                    client_name,
                    wm_dept_id,
                    work_order_numb,
                    part_numb,
                    uom,
                    is_active
                },
                    {
                        where: {
                            id: id
                        },
                        returning: true,
                        plain: true,
                    },
                    { transaction });
                res.status(200).json({
                    error: false,
                    message: 'updated work details',
                    data: work[1]
                })
            })
        } else {
            res.status(404).json({
                message: 'work not found'
            });

        }
    }
    catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const deleteWorkOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const work = await workOrderModel.findOne({ where: { id } });

        if (!work) {
            return res.status(404).json({ message: "WorkOrder data not found" });
        }

        // Check if the user is linked to any work tracking records
        let workTrackerWorkOrder = await Tracking.findOne({ where: { wm_work_orders_id: id } });

        // If linked to work records, prevent deletion and suggest marking as inactive
        if (workTrackerWorkOrder) {
            return res.status(400).json({
                error: false,
                message: "This work order cannot be deleted due to existing work records but can be marked as inactive for future use.",
                data: {},
            });
        }

        await workOrderModel.destroy(
            { where: { id } }
        );

        res.status(200).json({
            error: false,
            message: "WorkOrder data deleted",
            data: work,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const qrCodeGenerator = async (req, res, next) => {
    try {
        let { data } = req.body;
        // console.log("data",data);

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ message: 'Invalid QR Codes data' });
        }

        const formattedData = data.map(item => ({
            qr_code_path: item.qr_code_path,
            work_task_number: item.work_task_number,
            part_name: item.wrk_name,
            customer: item.client_name,
            operation_Description: item.wrk_process,
            operation: item.wrk_type,
            total_qty: item.total_quantity
        }));
        // console.log("formattedData",formattedData);      
        let replace = {
            formattedData: data.map(item => ({
                qr_code_path: item.qr_code_path,
                work_task_number: item.work_task_number,
                part_name: item.wrk_name,
                customer: item.client_name,
                operation: item.wrk_type,
                operation_description: item.wrk_process,
                total_qty: item.total_quantity
            }))
        }
        // console.log("formattedData",replace);
        // Path to the HTML template file
        const filePath = path.join(__dirname, '/../pdf/qrCode.html');
        const source = fs.readFileSync(filePath, 'utf8');
        const template = Handlebars.compile(source);

        // Generate HTML using Handlebars template
        let htmlToSend = template(replace);
        // console.log("htmlToSend", htmlToSend);

        res.json({ html: htmlToSend, fileName: `QRCODE.pdf` });
    } catch (err) {
        console.log("Error:", err);
        next(err);
    }
};




module.exports = {
    getAllWorkOrder,
    getAllWorkOrderByCIdAndWoId,
    getWorkOrderList,
    getWorkOrderListByDeptId,
    getWorkOrderByWorkOrderNumber,
    getWorkOrderByWorkOrderNumberList,
    getWorkOrderById,
    createWorkOrder,
    createManyWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    qrCodeGenerator
}