const companyModel = require('../models/wm_companyModel');
const departmentModel = require('../models/wm_departmentModel');

// reference get all company
const getAllDepartment = async (req, res) => {
    const { role_id, company_id, dept_id } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await departmentModel.findAll({ //super admin
                where: { is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 3000) {
            data = await departmentModel.findAll({ //company admin
                where: { company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await departmentModel.findAll({
                where: { id: dept_id, company_id: company_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 5000) { //employee
            data = await departmentModel.findAll({
                where: { id: dept_id, company_id: company_id, is_active: true, is_deleted: false },
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

        data = data.map(dept => ({
            id: dept.id,
            name: dept.name,
            company_id: dept.company_id,
            company_name: companies.find(c => c.id === dept?.company_id)?.name,
            address: dept.address,
            location_link: dept.location_link,
            about_text: dept.about_text,
            comp_unit_id: dept.comp_unit_id,
            created_at: dept.created_at,
            created_by: dept.created_by,
            updated_at: dept.updated_at,
            updated_by: dept.updated_by,
            is_active: dept.is_active,
            is_deleted: dept.is_deleted
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All department details",
            data: data,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getDepartmentList = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { c_id } = req.params;
        let data;
        if (role_id === 2000) {
            data = await departmentModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        } else if (role_id === 3000) {
            data = await departmentModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            data = await departmentModel.findAll({
                where: { company_id: c_id, id: dept_id, is_active: true, is_deleted: false },
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
            error: false,
            message: 'department list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};


const getDepartmentById = async (req, res, next) => {
    try {
        const { id, role_id, company_id, dept_id } = req.user;
        let { d_id } = req.params;
        const dept = await departmentModel.findOne({
            where: {
                id: d_id,
            },
            include: [{
                where: { is_deleted: false },
                model: companyModel,
                attributes: ['name'],
                required: false,
            }]
        });
        if (!dept) {
            res.status(404).json({
                error: true,
                message: 'department not found'
            });
        }
        const companies = await companyModel.findAll();

        const result = {
            id: dept.id,
            name: dept.name,
            company_id: dept.company_id,
            company_name: companies.find(c => c.id === dept.company_id)?.name,
            address: dept.address,
            about_text: dept.about_text,
            location_link: dept.location_link,
            comp_unit_id: dept.comp_unit_id,
            created_at: dept.created_at,
            created_by: dept.created_by,
            updated_at: dept.updated_at,
            updated_by: dept.updated_by,
            is_active: dept.is_active,
            is_deleted: dept.is_deleted
        };

        if (role_id === 2000) {
            res.status(200).json({
                error: false,
                message: 'department details',
                data: result
            })
        } else if (role_id === 3000 && result.company_id === company_id) {
            res.status(200).json({
                error: false,
                message: 'department details',
                data: result
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id && result.id === dept_id) {
            console.log("first")
            res.status(200).json({
                error: false,
                message: 'department details',
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

const createDepartment = async (req, res, next) => {
    try {
        const {
            company_id,
            name,
            address,
            location_link,
            about_text,
            comp_unit_id
        } = req.body;

        const deptData = await departmentModel.findOne({
            where: {
                company_id, comp_unit_id
            }
        })
        if (deptData) {
            return res.status(400).json({
                error: false,
                message: 'This Company Unit Id is already exist',
                data: null
            })
        }
        const dept = await departmentModel.create({
            company_id,
            name,
            address,
            location_link,
            about_text,
            comp_unit_id
        })
        res.status(201).json({
            error: false,
            message: 'created department details',
            data: dept
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

        next(error);
    }
}


const updateDepartment = async (req, res) => {
    try {
        const { id, company_id, name, address, location_link, about_text, comp_unit_id, is_active } = req.body;

        const dept = await departmentModel.findOne({ where: { id } });

        if (!dept) {
            return res.status(404).json({ message: "department not found" });
        }

        let deptData = {
            company_id,
            name,
            address,
            location_link,
            about_text,
            comp_unit_id,
            is_active
        }

        await departmentModel.update(
            deptData,
            { where: { id } }
        );

        const updateddept = await departmentModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "department updated",
            data: updateddept,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const dept = await departmentModel.findOne({ where: { id } });

        if (!dept) {
            return res.status(404).json({ message: "department data not found" });
        }

        let Data = {
            is_active: false,
            is_deleted: true,
        }

        await departmentModel.update(
            Data,
            { where: { id } }
        );

        const departmentUpdate = await departmentModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "department data deleted",
            data: departmentUpdate,
        });
    } catch (err) {
        console.log("error", err);
    }
};

module.exports = {
    getAllDepartment,
    getDepartmentList,
    // getDepartmentForSummaryData,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
}