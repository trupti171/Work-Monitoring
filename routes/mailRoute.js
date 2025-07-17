const express=require('express');
const mailController=require('../utils/mailUtils');

const router = express.Router()

router.post('/',mailController.sendEmail);



module.exports = router;