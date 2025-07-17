const express=require('express');
const multer = require("multer");
const userController=require('../controller/wm_userController');
const {authorizeOnlySAdmin,allRolesAuthorization}=require('../middleware/auth');

const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage }); // Use the memory storage in the upload middleware

const router = express.Router()

router.get('/',allRolesAuthorization, userController.getAllUsers);
router.get('/userlist',allRolesAuthorization, userController.getUserList)
router.get('/:id',allRolesAuthorization, userController.getSingleUser);
router.post('/sendmail', userController.forgetPassword);
router.post('/verifymail', userController.otpVerification);
router.patch('/confirm-pass', userController.confirmPassword);
router.patch('/',allRolesAuthorization, upload.fields([{ name: "img_link" },{ name: "qrcode_img" }]), userController.updateUser);
router.delete('/delete-user/:id',allRolesAuthorization, userController.deleteUser);

module.exports = router;