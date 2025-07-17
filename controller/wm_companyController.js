const companyModel = require('../models/wm_companyModel');
const departmentModel = require('../models/wm_departmentModel');
const { addLogo, awsLogoAcces, updateLogo } = require('../utils/awsUtils')

// reference get all company
const getAllCompany = async (req, res) => {
    const { role_id, company_id, dept_id } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await companyModel.findAll({ //super admin
                where: {is_active: true, is_deleted: false },
            });
        } else if (role_id === 3000) {
            data = await companyModel.findAll({ //company admin
                where: { id: company_id,is_active: true, is_deleted: false },
                include: [{
                    model: departmentModel,
                }]
            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await companyModel.findAll({
                where: { id: company_id,is_active: true, is_deleted: false },
            });
        } else if (role_id === 5000) { //employee
            data = await departmentModel.findAll({
                where: { id: dept_id,is_active: true, is_deleted: false },
                include: [{
                    model: companyModel,
                }]
            });
            data = [data[0].wm_company]
        }

        let updatedData = await Promise.all(data.map(async (item) => {
            // console.log("data11",item['logo']);
            if (item['company_logo'] !== null) {
                // console.log("item=>", item['logo'])
                item['company_logo'] = await awsLogoAcces(item['company_logo'], 'COMPANY');
                // console.log("s3 image=>", item['logo'])
            }
            return item; // Return the modified item
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All company details",
            data: updatedData,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getCompanyList = async (req, res, next) => {
    const { role_id, company_id } = req.user;

    try {
        let data;
        if (role_id === 2000) {
            data = await companyModel.findAll({
                where: { is_active: true, is_deleted: false },
            });
        } else {
            data = await companyModel.findAll({
                where: { is_active: true, is_deleted: false, id: company_id },
            });
        }

        let noOfRecords = data.length;
        res.status(200).json({
            noOfRecords: noOfRecords,
            data: data,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};


// const getCompanyForSummaryData = async (req, res, next) => {
//     const { role_id, company_id } = req.user;
//     try {
//         let data;
//         if (role_id === 2000) {
//             data = await companyModel.findAll({ // super admin
//                 where: { is_active: true, is_deleted: false },
//                 include: [{
//                     model: plantModel,
//                     attributes: []
//                 }]
//             });

//             for (let company of data) {
//                 const plantCount = await plantModel.count({
//                     where: { company_id: company.id, is_active: true, is_deleted: false }
//                 });
//                 company.dataValues.noOfPlants = plantCount;
//             }

//         } else {
//             data = await companyModel.findAll({ // company admin
//                 where: { id: company_id, is_active: true, is_deleted: false },
//                 include: [{
//                     model: plantModel,
//                     attributes: []
//                 }]
//             });

//             for (let company of data) {
//                 const plantCount = await plantModel.count({
//                     where: { company_id: company.id, is_active: true, is_deleted: false }
//                 });
//                 company.dataValues.noOfPlants = plantCount;
//             }
//         }
//         await Promise.all(data.map(async (item) => {
//             if (item['logo'] !== null) {
//                 item['logo'] = await awsLogoAcces(item['logo'], 'COMPANY');
//             }
//             return item; // Return the modified item
//         }));
//         let noOfRecords = await data.length;
//         return res.status(200).json({
//             error: false,
//             noOfRecords: noOfRecords,
//             message: "company dashboard",
//             data: data,
//         });
//     } catch (err) {
//         console.log("error", err);
//         next(err);
//     }
// };

const getCompanyById = async (req, res, next) => {
    try {
         const {id,role_id,company_id,dept_id}=req.user;
        let { cid } = req.params;
        const company = await companyModel.findOne({
            where: {
                id: cid,
                // is_deleted: false
            },
        });
        if (!company) {
            res.status(404).json({
                message: 'company not found'
            });
        } else {
            // let updatedData = await Promise.all(company.map(async (item) => {
            // console.log("data11",item['logo']);
            console.log("company==>",company)
            if (company['company_logo'] !== null) {
                // console.log("item=>", item['logo'])
                company['company_logo'] = await awsLogoAcces(company['company_logo'], 'COMPANY');
                // console.log("s3 image=>", item['logo'])
                // Return the modified item
            }
            if (role_id === 2000) {
                res.status(200).json({
                    message: 'company details',
                    data: company
                })
            } else if (role_id === 3000 && company.id === company_id) {
                res.status(200).json({
                    message: 'company details',
                    data: company
                })
            } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000)&& company.id === company_id) {
                console.log("first")
                res.status(200).json({
                    message: 'company details',
                    data: company
                })
            } else {
                return res.status(404).json({
                    message: "Authorization Restricted",
                    // data: []
                });
            }
            // res.status(200).json({
            //     message: 'company details',
            //     data: company
            // })
        }
        // ));
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

// const createCompany = async (req, res, next) => {
//     try {
//         const {
//             company_name,
//             address,
//             website,
//             // company_admin_id,
//             logo,
//         } = req.body;
//         // const image = req.file.path;
//         const company = await companyModel.create({
//             company_name,
//             address,
//             website,
//             // company_admin_id,
//             logo,
//             // image
//         })
//         res.status(201).json({
//             message: 'create company details',
//             data: company
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });

//         next(error);
//     }
// }

const createCompany = async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const { name, address, website,location_link,about_text } = jsonData;
        const image = req.files.img_link;

        let company_logo;
        if (image) {
            const imageData = await addLogo(image[0], 'COMPANY');
            company_logo = imageData.Key;
        }
        //    console.log("logo",logo);
        const company = await companyModel.create({
            name, address, website,location_link,about_text,
            company_logo,
        });

        res.status(201).json({
            message: 'created company details',
            data: company
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

const updateCompany = async (req, res, next) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const { id,name, address, website,location_link,about_text, is_active } = jsonData;
        const image = req.files.img_link;

        const company = await companyModel.findOne({ where: { id: id } });
        console.log("old logo", company.company_logo);
        if (company) {
            let company_logo;
            if (image) {
                const imageData = await updateLogo(company.company_logo, image[0], 'COMPANY');
                company_logo = imageData.Key;
            }
            await sequelize.transaction(async (transaction) => {

                const company = await companyModel.update({
                    name, address, website,location_link,about_text,company_logo,
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
                    // console.log("company",company);
                    
                res.status(200).json({
                    message: 'updated company details',
                    data: company[1]
                })
            })
        } else {
            res.status(404).json({
                message: 'company not found'
            });

        }
    }
    catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
}

const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await companyModel.findOne({ where: { id } });

        if (!company) {
            return res.status(404).json({ message: "company data not found" });
        }

        let Data = {
            is_active: false,
            is_deleted: true,
        }

        await companyModel.update(
            Data,
            { where: { id } }
        );

        const companyUpdate = await companyModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "company data deleted",
            data: companyUpdate,
        });
    } catch (err) {
        console.log("error", err);
    }
};

module.exports = {
    getAllCompany,
    getCompanyList,
    // getCompanyForSummaryData,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
}