const express=require('express');
const authController=require('../controller/wm_authController');
const { authorizeSAdminAndCAdmin }=require('../middleware/auth');


const router = express.Router()

router.post('/signup',authorizeSAdminAndCAdmin, authController.signUp);
router.post('/signin', authController.signIn);

module.exports=router;