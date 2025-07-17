const companyModel = require('../models/wm_companyModel');
const punchInOutModel = require('../models/wm_punch_in_outModel');
const wm_userModel = require('../models/wm_userModel');
const { Op, Transaction } = require('sequelize');


const getAllPunchInOut = async (req, res) => {
    const { role_id, company_id } = req.user;
    try {
        let data;
        if (role_id === 2000) {
            data = await punchInOutModel.findAll({ //super admin
                where: { is_active: true, is_deleted: false },
            });
        } else if (role_id === 3000) {
            data = await punchInOutModel.findAll({ //company admin
                where: { company_id: company_id, is_active: true, is_deleted: false },

            });
        }
        else if (role_id === 4000 || role_id === 6000) { // dept admin
            data = await punchInOutModel.findAll({
                where: { company_id: company_id, is_active: true, is_deleted: false },

            });
        } else if (role_id === 5000) { //employee
            data = await punchInOutModel.findAll({
                where: { company_id: company_id, is_active: true, is_deleted: false },

            });
        }
        else {
            return res.status(400).json({ error: true, message: 'Invalid role_id' });
        }

        const companies = await companyModel.findAll();
        const users = await wm_userModel.findAll();

        data = data.map(punch => ({
            id: punch.id,
            company_id: punch.company_id,
            company_name: companies.find(c => c.id === punch?.company_id)?.name,
            user_id: punch.user_id,
            wm_user_name: users.find(u => u.id === punch?.user_id)?.u_name,
            comp_empl_id: users.find(u => u.id === punch?.user_id)?.comp_empl_id,
            job_role: users.find(u => u.id === punch?.user_id)?.job_role,
            punch_in_time: punch.punch_in_time,
            punch_out_time: punch.punch_out_time,
            duration_work: punch.duration_work,
            created_at: punch.created_at,
            created_by: punch.created_by,
            updated_at: punch.updated_at,
            updated_by: punch.updated_by,
            is_active: punch.is_active,
            is_deleted: punch.is_deleted
        }));
        res.status(200).json({
            error: false,
            message: "Fetching All Punch In Out details",
            data: data,
        });
    } catch (err) {
        console.log("error", err);
    }
};

const getPunchInOutList = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { c_id } = req.params;
        let data;
        if (role_id === 2000) {
            data = await punchInOutModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        } else if (role_id === 3000) {
            data = await punchInOutModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        } else if (role_id === 4000 || role_id === 5000 || role_id === 6000) {
            data = await punchInOutModel.findAll({
                where: { company_id: c_id, is_active: true, is_deleted: false },

            })
        }
        if (!data) {
            res.status(404).json({ message: "data not found" });
            // throw new Error("data not found");
        }
        res.status(200).json({
            error: false,
            message: 'Punch In Out list details',
            data: data
        })
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: error.message });
        next(error);
    }
};

// track-work-in-progress
const getPunchInOutByCompanyID = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, user_id } = req.body;

        const punch = await punchInOutModel.findOne({
            where: {
                user_id: user_id,
                company_id: company_id,
                punch_out_time: null
            },
            order: [['updated_at', 'DESC']],
        });

        if (!punch) {
            return res.status(404).json({
                error: true,
                message: 'Punch In Out data not found'
            });
        }

        const companies = await companyModel.findAll();
        const users = await wm_userModel.findAll();

        const result = {
            id: punch.id,
            company_id: punch.company_id,
            company_name: companies.find(c => c.id === punch?.company_id)?.name,
            user_id: punch.user_id,
            wm_user_name: users.find(u => u.id === punch?.user_id)?.u_name,
            punch_in_time: punch.punch_in_time,
            punch_out_time: punch.punch_out_time,
            duration_work: punch.duration_work,
            created_at: punch.created_at,
            created_by: punch.created_by,
            updated_at: punch.updated_at,
            updated_by: punch.updated_by,
            is_active: punch.is_active,
            is_deleted: punch.is_deleted
        };

        if (role_id === 2000) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Punch In Out details based on company Id",

                data: result
            });
        } else if (role_id === 3000 && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Punch In Out details based on company Id",

                data: result
            });
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All Punch In Out details based on company Id",

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

// track-work-completed
const getPunchInOutCompletedByCompanyID = async (req, res, next) => {
    try {
        const { role_id, company_id: userCompanyId } = req.user;
        const { company_id, user_id } = req.body;

        const punch = await punchInOutModel.findOne({
            where: {
                user_id: user_id,
                company_id: company_id,
                punch_in_time: { [Op.ne]: null },
                punch_out_time: { [Op.ne]: null }
            },
            order: [['updated_at', 'DESC']],
        });

        if (!punch) {
            return res.status(404).json({
                error: true,
                message: 'Punch In Out data not found'
            });
        }

        const companies = await companyModel.findAll();
        const users = await wm_userModel.findAll();


        const result = {
            id: punch.id,
            company_id: punch.company_id,
            company_name: companies.find(c => c.id === punch?.company_id)?.name,
            user_id: punch.user_id,
            wm_user_name: users.find(u => u.id === punch?.user_id)?.u_name,
            punch_in_time: punch.punch_in_time,
            punch_out_time: punch.punch_out_time,
            duration_work: punch.duration_work,
            created_at: punch.created_at,
            created_by: punch.created_by,
            updated_at: punch.updated_at,
            updated_by: punch.updated_by,
            is_active: punch.is_active,
            is_deleted: punch.is_deleted
        };

        if (role_id === 2000) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on company Id",

                data: result
            });
        } else if (role_id === 3000 && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on company Id",

                data: result
            });
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === userCompanyId) {
            return res.status(200).json({
                error: false,
                message: "Fetching All details of work completed data based on company Id",

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

const getPunchInOutByUserId = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { user_id } = req.params;
        const punch = await punchInOutModel.findAll({
            where: {
                user_id: user_id,
            },
            attributes:['id','punch_in_time','punch_out_time']
        });
        if (!punch) {
            res.status(404).json({
                error: true,
                message: 'Punch In Out not found'
            });
        }
        // const companies = await companyModel.findAll();
        // const users = await wm_userModel.findAll();

        // const result = {
        //     id: punch.id,
        //     company_id: punch.company_id,
        //     company_name: companies.find(c => c.id === punch?.company_id)?.name,
        //     user_id: punch.user_id,
        //     wm_user_name: users.find(u => u.id === punch.user_id)?.u_name,
        //     punch_in_time: punch.punch_in_time,
        //     punch_out_time: punch.punch_out_time,
        //     duration_work: punch.duration_work,
        //     created_at: punch.created_at,
        //     created_by: punch.created_by,
        //     updated_at: punch.updated_at,
        //     updated_by: punch.updated_by,
        //     is_active: punch.is_active,
        //     is_deleted: punch.is_deleted
        // };

        if (role_id === 2000) {
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
                data: punch
            })
        } else if (role_id === 3000 && punch.company_id === company_id) {
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
                data: punch
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && punch.company_id === company_id) {
            console.log("first")
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
                data: punch
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

const getPunchInOutById = async (req, res, next) => {
    try {
        const { role_id, company_id, dept_id } = req.user;
        let { id } = req.params;
        const punch = await punchInOutModel.findOne({
            where: {
                id: id,
            }
        });
        if (!punch) {
            res.status(404).json({
                error: true,
                message: 'Punch In Out not found'
            });
        }
        const companies = await companyModel.findAll();
        const users = await wm_userModel.findAll();

        const result = {
            id: punch.id,
            company_id: punch.company_id,
            company_name: companies.find(c => c.id === punch?.company_id)?.name,
            user_id: punch.user_id,
            wm_user_name: users.find(u => u.id === punch.user_id)?.u_name,
            punch_in_time: punch.punch_in_time,
            punch_out_time: punch.punch_out_time,
            duration_work: punch.duration_work,
            created_at: punch.created_at,
            created_by: punch.created_by,
            updated_at: punch.updated_at,
            updated_by: punch.updated_by,
            is_active: punch.is_active,
            is_deleted: punch.is_deleted
        };

        if (role_id === 2000) {
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
                data: result
            })
        } else if (role_id === 3000 && result.company_id === company_id) {
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
                data: result
            })
        } else if ((role_id === 4000 || role_id === 5000 || role_id === 6000) && result.company_id === company_id) {
            console.log("first")
            res.status(200).json({
                error: false,
                message: 'Punch In Out details',
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

// const createPunchInOut = async (req, res, next) => {
//     try {
//         const {
//             company_id,
//             user_id,
//             punch_in_time,
//             punch_out_time
//         } = req.body;
//         let work;
//         let durationFormatted = null;

//         if (punch_out_time) {
//             const punchinTime = new Date(punch_in_time);
//             const punchoutTime = new Date(punch_out_time);

//             // Only calculate duration if logout_date_time is a valid date
//             if (!isNaN(punchoutTime.getTime())) {
//                 const durationMilliseconds = punchoutTime - punchinTime;
//                 const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
//                 const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
//                 const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

//                 // Combine into a formatted string
//                 durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;
//             }
//         }
//             work = await punchInOutModel.create({
//                 company_id,
//                 user_id,
//                 punch_in_time,
//                 punch_out_time,
//                 duration_work: durationFormatted
//             });
//         // } else {
//         //     work = await punchInOutModel.create({
//         //         company_id,
//         //         user_id,
//         //         punch_in_time,
//         //         punch_out_time
//         //     });
//         // }

//         res.status(201).json({
//             error: false,
//             message: 'Punch In Out details created successfully',
//             data: work
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//         next(error);
//     }
// };

const createPunchInOut = async (req, res, next) => {
    try {
        const {
            company_id,
            user_id,
            punch_in_time,
            punch_out_time
        } = req.body;

        let durationFormatted = null;

        if (punch_out_time) {
            const loginTime = new Date(punch_in_time);
            const logoutTime = new Date(punch_out_time);

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

        const work = await punchInOutModel.create({
            company_id,
            user_id,
            punch_in_time,
            punch_out_time,
            duration_work: durationFormatted
        });

        res.status(201).json({
            error: false,
            message: 'punch in out details created successfully',
            data: work
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
        next(error);
    }
};

const updatePunchInOut = async (req, res, next) => {
    try {
        const { id, company_id, user_id } = req.body;

        // Find the existing record by ID
        const trackingRecord = await punchInOutModel.findOne({
            where: { id },
            raw: true
        });

        if (!trackingRecord) {
            return res.status(404).json({ message: 'Tracking record not found' });
        }

        const punchinTime = new Date(trackingRecord.punch_in_time);
        const punchoutTime = new Date(); // Current time

        // Calculate the duration
        const durationMilliseconds = punchoutTime - punchinTime;
        const durationHours = Math.floor(durationMilliseconds / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const durationSeconds = Math.floor((durationMilliseconds % (1000 * 60)) / 1000);

        // Format the duration string
        const durationFormatted = `${durationHours} hours, ${durationMinutes} minutes, ${durationSeconds} seconds`;
        console.log("durationFormatted", durationFormatted);
        // Update the record with new values
        await sequelize.transaction(async (transaction) => {
            let userResponse = await punchInOutModel.update(
                {
                    company_id,
                    user_id,
                    punch_out_time: punchoutTime,
                    duration_work: durationFormatted
                },
                {
                    where: {
                        id: id
                    },
                    returning: true,
                    plain: true,
                },
                { transaction }
            );
            res.status(200).json({
                error: false,
                message: 'Updated Punch In Out details successfully',
                data: userResponse[1]
            });
        })


    } catch (error) {
        console.error('Error updating Punch In Out record:', error);
        res.status(500).json({ message: error.message });
        next(error);
    }
};


const deletePunchInOut = async (req, res) => {
    try {
        const { id } = req.params;

        const work = await punchInOutModel.findOne({ where: { id } });

        if (!work) {
            return res.status(404).json({ message: "Punch In Out data not found" });
        }

        let Data = {
            is_active: false,
            is_deleted: true,
        }

        await punchInOutModel.update(
            Data,
            { where: { id } }
        );

        const TrackingUpdate = await punchInOutModel.findOne({ where: { id } });

        res.status(200).json({
            error: false,
            message: "Punch In Out data deleted",
            data: TrackingUpdate,
        });
    } catch (err) {
        console.log("error", err);
    }
};

module.exports = {
    getAllPunchInOut,
    getPunchInOutList,
    getPunchInOutByCompanyID,
    getPunchInOutCompletedByCompanyID,
    getPunchInOutByUserId,
    getPunchInOutById,
    createPunchInOut,
    updatePunchInOut,
    deletePunchInOut,
}