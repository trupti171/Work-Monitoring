const express=require('express');
const departmentController=require('../controller/wm_departmentController');
const { allRolesAuthorization }=require('../middleware/auth');

const router = express.Router()

router.use(allRolesAuthorization);
router.get('/',departmentController.getAllDepartment);
router.get('/deptlist/:c_id',departmentController.getDepartmentList);
// router.get('/companydata/',departmentController.getCompanyForSummaryData);
router.get('/:d_id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.patch('/', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);


module.exports = router;