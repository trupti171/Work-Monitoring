const express=require('express');
const multer = require("multer");
const companyController=require('../controller/wm_companyController');
const { authorizeSAdminAndCAdmin }=require('../middleware/auth');

const router = express.Router()

const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage }); // Use the memory storage in the upload middleware

router.use(authorizeSAdminAndCAdmin);
router.get('/',companyController.getAllCompany);
router.get('/companylist',companyController.getCompanyList);
// router.get('/companydata/',companyController.getCompanyForSummaryData);
router.get('/:cid', companyController.getCompanyById);
router.post('/', upload.fields([{ name: "img_link" }]), companyController.createCompany);
router.patch('/',  upload.fields([{ name: "img_link" }]),companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);


module.exports = router;