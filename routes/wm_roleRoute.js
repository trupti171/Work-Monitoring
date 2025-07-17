const express=require('express');
const roleController=require('../controller/wm_roleController');

const router = express.Router()

router.get('/',roleController.getAllRole);
router.post('/', roleController.createRole);


module.exports = router;