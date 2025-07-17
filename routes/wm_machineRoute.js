const express=require('express');
const multer = require("multer");
const machineController=require('../controller/wm_machineController');
const { allRolesAuthorization }=require('../middleware/auth');

const router = express.Router()

const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage }); // Use the memory storage in the upload middleware

router.use(allRolesAuthorization);
router.get('/',machineController.getAllMachine);
router.get('/machinelist/:c_id',machineController.getMachineList);
// router.get('/companydata/',machineController.getCompanyForSummaryData);
router.get('/:m_id', machineController.getMachineById);
router.post('/', upload.fields([{ name: "img_link" }]), machineController.createMachine);
router.patch('/',  upload.fields([{ name: "img_link" },{ name: "qrcode_img" }]),machineController.updateMachine);
router.delete('/delete-machine/:id', machineController.deleteMachine);


module.exports = router;