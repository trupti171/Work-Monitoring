const companyModel = require('../models/wm_companyModel');
const machineModel = require('../models/wm_machineModel');
const departmentModel = require('../models/wm_departmentModel');
const { addLogo, awsLogoAcces, updateLogo } = require('../utils/awsUtils');
const Tracking = require('../models/wm_trackingModel');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
// reference get all company
const getAllMachine = async (req, res) => {
    const { role_id, company_id, dept_id: userDeptId } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await machineModel.findAll({ //super admin
                where: { is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 3000) {
            data = await machineModel.findAll({ //company admin
                where: { company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await machineModel.findAll({
                where: { company_id: company_id, dept_id: userDeptId, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 5000) { //employee
            data = await machineModel.findAll({
                where: { company_id: company_id, dept_id: userDeptId, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
            // data = [data[0].wm_department]
        }
        else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }

        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        data = data.map(machine => ({
            id: machine.id,
            m_name: machine.m_name,
            company_id: machine.company_id,
            company_name: companies.find(c => c.id === machine?.company_id)?.name,
            m_make: machine.m_make,
            m_model: machine.m_model,
            m_location: machine.m_location,
            m_type: machine.m_type,
            m_pic: machine.m_pic,
            qr_code_path: machine.qr_code_path,
            dept_id: machine.dept_id,
            department_name: departments.find(d => d.id === machine?.dept_id)?.name,
            machine_hourly_rate: machine.machine_hourly_rate,
            comp_machine_id: machine.comp_machine_id,
            created_at: machine.created_at,
            created_by: machine.created_by,
            updated_at: machine.updated_at,
            updated_by: machine.updated_by,
            is_active: machine.is_active,
            is_deleted: machine.is_deleted
        }));

        let updatedData = await Promise.all(data.map(async (item) => {
            // console.log("data11",item['logo']);
            if (item['m_pic'] !== null) {
                item['m_pic'] = await awsLogoAcces(item['m_pic'], 'MACHINE');
            }
            if (item['qr_code_path'] !== null) {
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');
            }
            return item; // Return the modified item
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All machines details",
            data: updatedData,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getMachineList = async (req, res, next) => {
    try {
        const { role_id, company_id } = req.user;
        let { c_id } = req.params;
        let data;
        if (role_id === 2000) {
            data = await machineModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                // include: [{
                //     model: companyModel,
                // }]
            })
        } else if (role_id === 3000) {
            data = await machineModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                // include: [{
                //     model: companyModel,
                // }]
            })
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            data = await machineModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                // include: [{
                //     model: companyModel,
                // }]
            })
        }
        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        res.status(200).json({
            error: false,
            message: 'machine list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};


const getMachineById = async (req, res, next) => {
    try {
        const { id, role_id, company_id, dept_id } = req.user;
        let { m_id } = req.params;
        const machine = await machineModel.findOne({
            where: {
                id: m_id,
                is_active: true,
            },
            include: [{
                where: { is_active: true, is_deleted: false },
                model: companyModel,
                attributes: ['name'],
                required: false,
            }]
        });
        if (!machine) {
            res.status(404).json({
                error: true,
                message: 'machine not found'
            });
        }
        const companies = await companyModel.findAll();
        const departments = await departmentModel.findAll();

        const result = {
            id: machine.id,
            m_name: machine.m_name,
            company_id: machine.company_id,
            company_name: companies.find(c => c.id === machine?.company_id)?.name,
            m_make: machine.m_make,
            m_model: machine.m_model,
            m_location: machine.m_location,
            m_type: machine.m_type,
            m_pic: machine.m_pic,
            qr_code_path: machine.qr_code_path,
            dept_id: machine.dept_id,
            dept_name: departments.find(d => d.id === machine?.dept_id)?.name,
            machine_hourly_rate: machine.machine_hourly_rate,
            comp_machine_id: machine.comp_machine_id,
            created_at: machine.created_at,
            created_by: machine.created_by,
            updated_at: machine.updated_at,
            updated_by: machine.updated_by,
            is_active: machine.is_active,
            is_deleted: machine.is_deleted
        };
        if (result['m_pic'] !== null) {
            result['m_pic'] = await awsLogoAcces(result['m_pic'], 'MACHINE');
        }
        if (result['qr_code_path'] !== null) {
            result['qr_code_path'] = await awsLogoAcces(result['qr_code_path'], 'QRCODE');
        }
        if (role_id === 2000) {
            res.status(200).json({
                error: false,
                message: ' Fetching machine details by id',
                data: result
            })
        } else if (role_id === 3000 && result.company_id === company_id) {
            res.status(200).json({
                error: false,
                message: 'Fetching machine details by id',
                data: result
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id) {
            console.log("first")
            res.status(200).json({
                error: false,
                message: 'Fetching machine details by id',
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

const createMachine = async (req, res, next) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const { company_id, m_name, m_make, m_model, m_location, m_type, dept_id, machine_admin_id, machine_hourly_rate, comp_machine_id } = jsonData;
        const image = req.files.img_link;

        const existMachine = await machineModel.findOne({
            where: {
                company_id,
                comp_machine_id
            }
        });
        if (existMachine) {
            return res.status(400).json({
                error: true,
                message: 'comp_machine_id already exists for this company_id.'
            });
        }

        let m_pic;
        if (image) {
            const imageData = await addLogo(image[0], 'MACHINE');
            m_pic = imageData.Key;
        }
        //    console.log("logo",logo);
        const machine = await machineModel.create({
            company_id, m_name, m_make, m_model, m_location, m_type, dept_id, machine_admin_id, m_pic, machine_hourly_rate, comp_machine_id
        });

        res.status(201).json({
            error: false,
            message: 'created machine details',
            data: machine
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
}

const updateMachine = async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const { id, company_id, m_name, m_make, m_model, m_location, m_type, dept_id, machine_admin_id, is_active, machine_hourly_rate, comp_machine_id } = jsonData;
        const image = req.files.img_link;
        const qrCodeImage = req.files ? req.files.qrcode_img : null;

        const machine = await machineModel.findOne({ where: { id: id } });
        // console.log("old logo", machine.m_pic);
        if (machine) {
            let m_pic, qr_code_path;
            if (image) {
                const imageData = await updateLogo(machine.m_pic, image[0], 'MACHINE');
                m_pic = imageData.Key;
            } if (qrCodeImage) {
                const qrCodeImageData = await updateLogo(machine.qr_code_path, qrCodeImage[0], 'QRCODE');
                qr_code_path = qrCodeImageData.Key;
            }
            await sequelize.transaction(async (transaction) => {

                const machine = await machineModel.update({
                    company_id, m_name, m_make, m_model, m_location, m_type, qr_code_path, dept_id, machine_admin_id, m_pic, machine_hourly_rate, comp_machine_id,
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
                    message: 'updated machine details',
                    data: machine[1]
                })
            })
        } else {
            res.status(404).json({
                message: 'machine not found'
            });

        }
    }
    catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;

        const machine = await machineModel.findOne({ where: { id } });

        if (!machine) {
            return res.status(404).json({ message: "machine data not found" });
        }
        // Check if the user is linked to any work tracking records
        let workTrackerMachine = await Tracking.findOne({ where: { wm_machines_id: id } });

        // If linked to work records, prevent deletion and suggest marking as inactive
        if (workTrackerMachine) {
            return res.status(400).json({
                error: false,
                message: "This machine cannot be deleted due to existing work records but can be marked as inactive for future use.",
                data: {},
            });
        }
        // Delete the user record if no work tracking exists
        await machineModel.destroy(
            { where: { id } }
        );

        res.status(200).json({
            error: false,
            message: "machine data deleted",
            data: machine,
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
                m_name: item.m_name,
                qr_code_path: item.qr_code_path,
                comp_machine_id: item.comp_machine_id
        }));
        // console.log("formattedData",formattedData);      
        let replace = {
            formattedData
        }
        // console.log("formattedData",replace);
        // Path to the HTML template file
        const filePath = path.join(__dirname, '/../pdf/machineQRCode.html');
        const source = fs.readFileSync(filePath, 'utf8');
        const template = Handlebars.compile(source);

        // Generate HTML using Handlebars template
        let htmlToSend = template(replace);
        console.log("htmlToSend", htmlToSend);

        res.json({ html: htmlToSend, fileName: `MachineQRCODE.pdf` });
    } catch (err) {
        console.log("Error:", err);
        next(err);
    }
};

module.exports = {
    getAllMachine,
    getMachineList,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine,
    qrCodeGenerator
}