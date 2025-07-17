
const Role=require('../models/wm_roleModel');

const getAllRole = async (req, res) => {
  try {
    const role = await Role.findAll({
    });
    res.status(200).json({
      error: false,
      message: "All roles list fetched",
      data: role,
    });
  } catch (err) {
    console.log("error", err);
  }
};

const createRole = async (req, res, next) => {
    try {
        const {
            role_id,
            role_name,
        } = req.body;
        const role = await Role.create({
            role_id,
            role_name,
        })
        res.status(201).json({
            message: 'created role details',
            data: role
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        next(error);
    }
}

module.exports={
    createRole,
    getAllRole
}