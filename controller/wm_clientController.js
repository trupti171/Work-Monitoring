const companyModel = require('../models/wm_companyModel');
const clientModel = require('../models/wm_clientModel');

// reference get all company
const getAllClient = async (req, res) => {
    const { role_id, company_id } = req.user;
    // console.log("role",role_id,company_id);
    try {
        let data;
        if (role_id === 2000) {
            data = await clientModel.findAll({ //super admin
                where: { is_active: true,is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 3000) {
            data = await clientModel.findAll({ //company admin
                where: { company_id: company_id,is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await clientModel.findAll({
                where: { id: dept_id, company_id: company_id,is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
        } else if (role_id === 5000) { //employee
            data = await clientModel.findAll({
                where: { id: dept_id, company_id: company_id,is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                    attributes: ['name'],
                }]
            });
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
            location: dept.location,
            phone: dept.phone,
            company: dept.company,
            business: dept.business,
            client_eml_id: dept.client_eml_id,
            created_at: dept.created_at,
            created_by: dept.created_by,
            updated_at: dept.updated_at,
            updated_by: dept.updated_by,
            is_active: dept.is_active,
            is_deleted: dept.is_deleted
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All client details",
            data: data,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getClientList = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { c_id } = req.params;
        let data;
        if(role_id===2000){
            data = await clientModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        }else if(role_id===3000){
            data = await clientModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            })
        }else if(role_id===4000 || role_id===5000 || role_id === 6000 ){
            data = await clientModel.findAll({
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
            error: false,
            message: 'client list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};


const getClientById = async (req, res, next) => {
    try {
        const {  role_id, company_id } = req.user;
        let { id } = req.params;
        const dept = await clientModel.findOne({
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
            company_name: companies.find(c => c.id === dept?.company_id)?.name,
            address: dept.address,
            location: dept.location,
            phone: dept.phone,
            company: dept.company,
            business: dept.business,
            client_eml_id: dept.client_eml_id,
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
                    message: 'client details',
                    data: result
                })
            } else if (role_id === 3000 && result.company_id === company_id) {
                res.status(200).json({
                    error: false,
                    message: 'client details',
                    data: result
                })
            } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id) {
                console.log("first")
                res.status(200).json({
                    error: false,
                    message: 'client details',
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

const createClient = async (req, res, next) => {
    try {
        const {
            company_id,
            name,
            address,
            location,
            phone,
            company,
            business,
            client_eml_id
        } = req.body;

        const dept = await clientModel.create({
            company_id,
            name,
            address,
            location,
            phone,
            company,
            business,
            client_eml_id
        })
        res.status(201).json({
            error: false,
            message: 'created client details',
            data: dept
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

        next(error);
    }
}


const updateClient = async (req, res) => {
    try {
        const { id,
             company_id,
            name,
            address,
            location,
            phone,
            company,
            business,
            client_eml_id,
             is_active } = req.body;

        const dept = await clientModel.findOne({ where: { id } });

        if (!dept) {
            return res.status(404).json({ message: "client not found" });
        }

        let deptData = {
            company_id,
            name,
            address,
            location,
            phone,
            company,
            business,
            client_eml_id,
            is_active
        }

        await clientModel.update(
            deptData,
            { where: { id } }
        );

        const updateddept = await clientModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "client updated",
            data: updateddept,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        const dept = await clientModel.findOne({ where: { id } });

        if (!dept) {
            return res.status(404).json({ message: "client data not found" });
        }

        let Data = {
            is_active: false,
            is_deleted: true,
        }

        await clientModel.update(
            Data,
            { where: { id } }
        );

        const departmentUpdate = await clientModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "client data deleted",
            data: departmentUpdate,
        });
    } catch (err) {
        console.log("error", err);
    }
};

module.exports = {
    getAllClient,
    getClientList,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
}