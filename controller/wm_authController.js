const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');
const User = require('../models/wm_userModel');
const companyModel = require('../models/wm_companyModel');
const departmentModel = require('../models/wm_departmentModel');
const machineModel = require('../models/wm_machineModel');

const signUp = async (req, res, next) => {
  try {
    // console.log("first====>>>");
    const { u_name: name } = req.user

    let { u_name, email_id, phone_no, u_password, location, job_role, employe_grade_level, comp_empl_id, company_id, dept_id, role_id } = req.body;
    // console.log("body", req.body);
    let sendUserData;
    if (email_id && email_id.trim() !== '') {
      email_id = email_id.toLowerCase();
      const isUserExists = await User.findOne({ where: { email_id: email_id } });
      if (isUserExists) {
        return res.status(409).json({
          error: true,
          message: "User with this email already exists",
          data: null,
        });
      }
    } else {
      // sendUserData.email_id = null;
    }
    // console.log("authController : signup :: email_id is ", email_id);
    const isUserCompEmpIdExists = await User.findOne({
      where: {
        comp_empl_id: comp_empl_id,
        company_id: company_id
      }
    });
    if (isUserCompEmpIdExists) {
      return res.status(409).json({
        error: true,
        message: "Employee ID already exists for this company",
        data: null,
      });
    }
    sendUserData = {
      u_name,
      phone_no,
      email_id,
      location,
      job_role,
      employe_grade_level,
      comp_empl_id,
      company_id,
      dept_id,
      role_id,
      created_by: name,
      updated_by: name,
    }
    if (u_password) {
      let saltRound = 10;
      let salt = await bcrypt.genSalt(saltRound);
      sendUserData.u_password = await bcrypt.hash(u_password, salt);
    } else {
      sendUserData.u_password = null;
    }


    await sequelize.transaction(async (transaction) => {

      let userResponse = await User.create(
        sendUserData,
        { transaction }
      );

      // console.log("userResponse===>>>", userResponse);
      res.status(200).json({
        error: false,
        message: "Register Successfully",
        data: [userResponse],
      });
    });

  } catch (err) {
    console.log("error", err);
    next(err);
  } finally {
    console.timeEnd("authController : signup");
  }
};

// const signUp = async (req, res, next) => {
//   const { role_id, company_id: userCID, dept_id: userDID } = req.user
//   let { u_name, email_id, phone_no, u_password, location, job_role, employe_grade_level, comp_empl_id, company_id, dept_id } = req.body;
//   // console.log("req.user", req.user);
//   email_id = email_id.toLowerCase();
//   // console.log("authController : signup :: email_id is ", email_id);
//   try {
//     const isUserExists = await User.findOne({ where: { email_id: email_id } });
//     const isUserCompEmpIdExists = await User.findOne({
//       where: {
//         comp_empl_id: comp_empl_id,
//         company_id: userCID
//       }
//     });
//     // console.log("authController : signup :: isUserExists : ", isUserExists);
//     if (isUserExists) {
//       return res.status(409).json({
//         error: true,
//         message: "User with this email already exists",
//         data: null,
//       });
//     }
//     if (isUserCompEmpIdExists) {
//       return res.status(409).json({
//         error: true,
//         message: "Employee ID already exists for this company",
//         data: null,
//       });
//     }
//     else {
//       let saltRound = 10;
//       let salt = await bcrypt.genSalt(saltRound);
//       let hashedu_password = await bcrypt.hash(u_password, salt);

//       if (role_id === 2000) { // Super Admin
//         company_id = userCID || null;
//         dept_id = userDID || null;
//       } else if (role_id === 3000) { // Company Admin
//         company_id = userCID;
//         dept_id = userDID || null;
//       } else if (role_id === 4000) { // Department Admin
//         company_id = userCID;
//         dept_id = userDID;
//       }

//       await sequelize.transaction(async (transaction) => {
//         let userResponse = await User.create(
//           {
//             u_name,
//             email_id,
//             phone_no,
//             location,
//             job_role,
//             employe_grade_level,
//             comp_empl_id,
//             company_id,
//             dept_id,
//             u_password: hashedu_password,
//             created_by: u_name,
//             updated_by: u_name,
//           },
//           { transaction }
//         );

//         // console.log("userResponse===>>>", userResponse);
//         res.status(200).json({
//           error: false,
//           message: "Register Successfully",
//           data: [userResponse],
//         });
//       });
//     }
//   } catch (err) {
//     console.log("error", err);
//     next(err);
//   } finally {
//     console.timeEnd("authController : signup");
//   }
// };

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * */


const signIn = async (req, res, next) => {
  try {
    let email_id = req.body.email_id;
    const enteredpassword = req.body.u_password;

    email_id = email_id.toLowerCase();
    let user = await User.findOne({
      where: { email_id: email_id },
      include: [
        { model: companyModel, attributes: ['name'] },
        { model: departmentModel, attributes: ['name'] },
        { model: machineModel, attributes: ['m_name'] }
      ]
    });
    // console.log("user", user);

    if (user) {
      const { id, u_name, u_password, role_id, job_role, company_id, dept_id, machine_id, user_pic, is_active } = user;
      let company_name = user?.wm_company?.name;
      let department_name = user?.wm_department?.name;
      let machine_name = user?.wm_machine?.m_name;
      // console.log("company_name", company_name);

      if (is_active === false) return res.status(403).json({
        error: true,
        message: "You Can't Signin without Your Id Active",
        data: null,
      });
      const storedpassword = u_password;

      let ispasswordValid = await bcrypt.compare(
        enteredpassword,
        storedpassword
      );
      if (ispasswordValid) {
        const payload = {
          id,
          u_name,
          role_id,
          job_role,
          company_id,
          company_name: user?.wm_company?.name,
          department_name: user?.wm_department?.name,
          machine_name: user?.wm_machine?.m_name,
          dept_id, machine_id, user_pic
        };
        const token = jwt.sign(payload, "secretkey",
          // {
          //   expiresIn: "30d",
          // }
        );
        // console.log("payload",payload);

        res.status(200).json({
          id,
          u_name,
          role_id,
          job_role,
          company_id,
          dept_id,
          machine_id,
          company_name: user?.wm_company?.name,
          department_name: user?.wm_department?.name,
          machine_name: user?.wm_machine?.m_name,
          user_pic,
          token: token,
        });
      } else {
        res.status(403).json({
          error: true,
          message: "Invalid password",
          data: null,
        });
      }
    } else {
      res.status(401).json({
        error: true,
        message: "Invalid email_id",
        data: null,
      });
    }
  } catch (err) {
    console.log("error", err);
    next(err);
  }
};

module.exports = {
  signUp,
  signIn,
};