const User = require('../models/wm_userModel');
const roleModel = require('../models/wm_roleModel');
const companyModel = require('../models/wm_companyModel');
const departmentModel = require('../models/wm_departmentModel');
const machineModel = require('../models/wm_machineModel');
const punchInOutModel = require('../models/wm_punch_in_outModel');
const { addLogo, awsLogoAcces, updateLogo } = require('../utils/awsUtils')
const generateOTP = require('../utils/otp');
const { sendEmail } = require('../utils/mailUtils');
const bcrypt = require('bcrypt');
const Tracking = require('../models/wm_trackingModel');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const getAllUsers = async (req, res) => {
    try {
        const { id, u_name, role_id, company_id, dept_id } = req.user;
        let users;
        if (role_id === 2000) {
            users = await User.findAll({
                where: { is_deleted: false },
                include: [{
                    model: roleModel,
                    attributes: ['role_name'],
                    required: false,
                }],
            });
        } else if (role_id === 3000) {
            users = await User.findAll({
                where: { company_id: company_id, is_deleted: false },
                include: [{
                    model: roleModel,
                    attributes: ['role_name'],
                    required: false,
                }]
            });
        } else if (role_id === 4000 || role_id === 6000) {
            users = await User.findAll({
                where: { company_id: company_id, dept_id: dept_id, is_deleted: false },
                include: [{
                    model: roleModel,
                    attributes: ['role_name'],
                    required: false,
                }]
            });
        } else if (role_id === 5000) {
            users = await User.findAll({
                where: { company_id: company_id, dept_id: dept_id, is_deleted: false },
                include: [{
                    model: roleModel,
                    attributes: ['role_name'],
                    required: false,
                }]
            });
        }
        const companies = await companyModel.findAll();
        const department = await departmentModel.findAll();
        const machines = await machineModel.findAll();

        users = users.map(user => ({
            id: user.id,
            u_name: user.u_name,
            email_id: user.email_id,
            phone_no: user.phone_no,
            u_password: user.u_password,
            role_id: user.role_id,
            role_name: user?.wm_role?.role_name,
            company_id: user.company_id,
            company_name: companies.find(c => c.id === user?.company_id)?.name,
            dept_id: user.dept_id,
            dept_name: department.find(d => d.id === user?.dept_id)?.name,
            machine_id: user.machine_id,
            m_name: machines.find(m => m.id === user?.machine_id)?.m_name,
            job_role: user.job_role,
            manager_id: user.manager_id,
            location: user.location,
            user_pic: user.user_pic,
            qr_code_path: user.qr_code_path,
            user_path: user.user_path,
            qr_code_number: user.qr_code_number,
            employe_grade_level: user.employe_grade_level,
            hourly_rate: user.hourly_rate,
            comp_empl_id: user.comp_empl_id,
            created_at: user.created_at,
            created_by: user.created_by,
            updated_at: user.updated_at,
            updated_by: user.updated_by,
            is_active: user.is_active,
            is_deleted: user.is_deleted
        }));

        let updatedData = await Promise.all(users.map(async (item) => {
            // console.log("data11",item['logo']);
            if (item['user_pic'] !== null) {
                item['user_pic'] = await awsLogoAcces(item['user_pic'], 'USER');

            }
            if (item['qr_code_path'] !== null) {
                item['qr_code_path'] = await awsLogoAcces(item['qr_code_path'], 'QRCODE');

            }
            return item; // Return the modified item
        }));
        res.status(200).json({
            error: false,
            message: "All Users",
            data: updatedData,

        });
    } catch (err) {
        console.log("error", err);
    }
};

const getUserList = async (req, res, next) => {
    try {
        const { u_name, role_id, company_id, dept_id } = req.user;
        // let { id } = req.params;
        let user;
        if (role_id === 2000) {
            user = await User.findAll({
                where: { is_active: true, is_deleted: false },
            })
        } else {
            user = await User.findAll({
                where: { company_id: company_id, is_active: true, is_deleted: false },
                // include: [{
                //     model: companyModel,
                //     required: false,
                // }]
            })
        }
        if (!user) {
            res.status(404).json({ message: "user not found" });
        }
        let noOfRecords = user.length;
        res.status(200).json({
            error: false,
            noOfRecords: noOfRecords,
            message: 'user details',
            data: user
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
}

const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: {
                id,
                is_deleted: false,
            },
            include: [{
                model: roleModel,
                attributes: ['role_name'],
                required: false,
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const companies = await companyModel.findAll();
        const department = await departmentModel.findAll();
        const machines = await machineModel.findAll();

        const result = {
            id: user.id,
            u_name: user.u_name,
            email_id: user.email_id,
            phone_no: user.phone_no,
            u_password: user.u_password,
            role_id: user.role_id,
            role_name: user?.wm_role?.role_name,
            company_id: user.company_id,
            company_name: companies.find(c => c.id === user?.company_id)?.name,
            dept_id: user.dept_id,
            dept_name: department.find(d => d.id === user?.dept_id)?.name,
            machine_id: user.machine_id,
            m_name: machines.find(m => m.id === user?.machine_id)?.m_name,
            job_role: user.job_role,
            manager_id: user.manager_id,
            location: user.location,
            user_pic: user.user_pic,
            qr_code_path: user.qr_code_path,
            user_path: user.user_path,
            qr_code_number: user.qr_code_number,
            employe_grade_level: user.employe_grade_level,
            hourly_rate: user.hourly_rate,
            comp_empl_id: user.comp_empl_id,
            created_at: user.created_at,
            created_by: user.created_by,
            updated_at: user.updated_at,
            updated_by: user.updated_by,
            is_active: user.is_active,
            is_deleted: user.is_deleted
        };
        if (result['user_pic'] !== null) {
            result['user_pic'] = await awsLogoAcces(result['user_pic'], 'USER');

        }
        if (result['qr_code_path'] !== null) {
            result['qr_code_path'] = await awsLogoAcces(result['qr_code_path'], 'QRCODE');

        }
        // console.log("result",result);

        res.status(200).json({
            error: false,
            message: "Getting Single User details",
            data: result,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const updateUser = async (req, res) => {
    try {
        const jsonData = JSON.parse(req.body.json);
        const {
            id, u_name, email_id, phone_no, u_password, role_id, company_id, dept_id, machine_id, job_role,
            location, manager_id, user_path, qr_code_number, is_active, hourly_rate, employe_grade_level, comp_empl_id
        } = jsonData;
        let user_pic, qr_code_path;

        const image = req.files ? req.files.img_link : null;
        const qrCodeImage = req.files ? req.files.qrcode_img : null;
        const user = await User.findOne({
            where: { id },
            include: [{
                model: punchInOutModel,
                attributes: ['punch_in_time', 'punch_out_time'],
                required: false,
            }],
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // console.log("Old logo", user.user_pic);

        if (image) {
            const imageData = await updateLogo(user.user_pic, image[0], 'USER');
            user_pic = imageData.Key;
        } else {
            user_pic = user.user_pic;
        }
        if (qrCodeImage) {
            const qrCodeImageData = await updateLogo(user.qr_code_path, qrCodeImage[0], 'QRCODE');
            qr_code_path = qrCodeImageData.Key;
        } else {
            qr_code_path = user.qr_code_path;
        }
        await sequelize.transaction(async (transaction) => {
            const updateData = {
                u_name,
                email_id,
                phone_no,
                role_id,
                company_id,
                dept_id,
                machine_id,
                job_role,
                location,
                manager_id,
                user_pic,
                qr_code_path,
                user_path,
                qr_code_number,
                is_active,
                hourly_rate, employe_grade_level, comp_empl_id
            };

            if (u_password) {
                const salt = await bcrypt.genSalt(10);
                updateData.u_password = await bcrypt.hash(u_password, salt);
            }

            let data = await User.update(updateData, {
                where: { id },
                raw: true, transaction
            });

            // Fetch updated user details with punch-in data
            const updatedUser = await User.findOne({
                where: { id },
                include: [{
                    model: punchInOutModel,
                    attributes: ['punch_in_time', 'punch_out_time'],
                    required: false,
                }],
                transaction
            });

            res.status(200).json({
                message: 'User details updated successfully',
                data: updatedUser
            });
        });


    } catch (err) {
        console.log("Error", err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

// const updateUser = async (req, res) => {
//     try {

//         const { id, u_name, email_id, phone_no, u_password, role_id, company_id, dept_id, job_role, location, manager_id, user_pic, qr_code_path, user_path, qr_code_number, is_active } = req.body;

//         const user = await User.findOne({ where: { id } });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         let useData = {
//             u_name,
//             email_id,
//             phone_no,
//             u_password,
//             role_id,
//             company_id,
//             dept_id,
//             job_role,
//             location,
//             manager_id,
//             user_pic,
//             qr_code_path,
//             user_path,
//             qr_code_number,
//             is_active
//         }

//         //ecrypt password
//         if (u_password) {
//             const salt = await bcrypt.genSalt(10);
//             useData.u_password = await bcrypt.hash(u_password, salt);
//         }

//         await User.update(
//             useData,
//             { where: { id } }
//         );

//         const updatedUser = await User.findOne({ where: { id } });

//         res.status(200).json({
//             error: false,
//             message: "User updated",
//             data: updatedUser,
//         });
//     } catch (err) {
//         console.log("error", err);
//     }
// };

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user by ID
        const user = await User.findOne({ where: { id } });

        // If the user is not found, return a 404 error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is linked to any work tracking records
        let workTrackerUser = await Tracking.findOne({ where: { wm_users_id: id } });

        // If linked to work records, prevent deletion and suggest marking as inactive
        if (workTrackerUser) {
            return res.status(400).json({
                error: false,
                message: "This employee cannot be deleted due to existing work records but can be marked as inactive for future use.",
                data: {},
            });
        }
        // Delete the user record if no work tracking exists
        await User.destroy({
            where: { id }  // Correct usage of destroy with where condition
        });

        res.status(200).json({
            error: false,
            message: "User deleted",
            data: user,  // Return the deleted user data if needed
        });
    } catch (err) {
        console.log("error", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
};


const forgetPassword = async (req, res, next) => {
    try {
        const { email_id } = req.body;

        // Fetch user data
        const userData = await User.findOne({ where: { email_id: email_id } });

        if (!userData) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: 'User email does not exist.',
                data: null
            });
        }

        // Generate OTP
        const otpCode = generateOTP(4); // Generate a 4-digit OTP

        // Store OTP in the database or a temporary store
        userData.otp_number = otpCode;
        await userData.save();

        // Send OTP to user via email
        await sendEmail(email_id, otpCode);

        // Send response
        return res.status(200).json({
            success: true,
            code: 200,
            message: `OTP sent to ${email_id} kindly check it`,
            data: {
                email_id
            }
        });

    } catch (err) {
        console.error('Error in forgetPassword:', err);
        next(err);
    }
};

const otpVerification = async (req, res, next) => {
    try {
        let { email_id, otp_number } = req.body;

        otp_number = await otp_number * 1;

        // Fetch user data
        const userData = await User.findOne({
            where: {
                email_id: email_id,
                otp_number: otp_number
            }
        });

        if (!userData) {
            return res.status(404).json({
                success: false,
                code: 404,
                message: 'OTP is wrong...retry again',
                data: null
            });
        }

        // Send response
        return res.status(200).json({
            success: true,
            code: 200,
            message: `OTP Matched!`,
            data: {
                email_id
            }
        });

    } catch (err) {
        console.error('Error in forgetPassword:', err);
        next(err);
    }
};

const confirmPassword = async (req, res) => {
    try {
        let { email_id, u_password } = req.body;

        if (!email_id) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email_id: email_id } });

        if (!user) {
            return res.status(404).json({ message: "User email not found" });
        }

        //ecrypt password
        if (u_password) {
            const salt = await bcrypt.genSalt(10);
            u_password = await bcrypt.hash(u_password, salt);

            let userResponse = await User.update(
                { u_password },
                { where: { email_id } }
            );

            res.status(200).json({
                error: false,
                message: "User password updated successfully",
                data: userResponse,
            });

        }

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
                u_name: item.u_name,
                email_id: item.email_id,
                phone_no: item.phone_no,
                role_id: item.role_id,
                company_id: item.company_id,
                dept_id: item.dept_id,
                machine_id: item.machine_id,
                job_role: item.job_role,
                location: item.location,
                manager_id: item.manager_id,
                user_pic: item.user_pic,
                qr_code_path: item.qr_code_path,
                user_path: item.user_path,
                qr_code_number: item.qr_code_number,
                hourly_rate: item.hourly_rate,
                employe_grade_level: item.employe_grade_level,
                comp_empl_id: item.comp_empl_id
        }));
        // console.log("formattedData",formattedData);      
        let replace = {
            formattedData: data.map(item => ({
                u_name: item.u_name,
                email_id: item.email_id,
                phone_no: item.phone_no,
                role_id: item.role_id,
                company_id: item.company_id,
                dept_id: item.dept_id,
                machine_id: item.machine_id,
                job_role: item.job_role,
                location: item.location,
                manager_id: item.manager_id,
                user_pic: item.user_pic,
                qr_code_path: item.qr_code_path,
                user_path: item.user_path,
                qr_code_number: item.qr_code_number,
                hourly_rate: item.hourly_rate,
                employe_grade_level: item.employe_grade_level,
                comp_empl_id: item.comp_empl_id
            }))
        }
        // console.log("formattedData",replace);
        // Path to the HTML template file
        const filePath = path.join(__dirname, '/../pdf/employeeQRCode.html');
        const source = fs.readFileSync(filePath, 'utf8');
        const template = Handlebars.compile(source);

        // Generate HTML using Handlebars template
        let htmlToSend = template(replace);
        console.log("htmlToSend", htmlToSend);

        res.json({ html: htmlToSend, fileName: `EmployeeQRCODE.pdf` });
    } catch (err) {
        console.log("Error:", err);
        next(err);
    }
};

module.exports = {
    getAllUsers,
    getUserList,
    // getUserCompanyList,
    getSingleUser,
    updateUser,
    deleteUser,
    forgetPassword,
    otpVerification,
    confirmPassword,
    qrCodeGenerator
};


