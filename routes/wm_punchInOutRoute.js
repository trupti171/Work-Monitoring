const express=require('express');
const punchInOutController=require('../controller/wm_punchInOutController');
const { allRolesAuthorization }=require('../middleware/auth');

const router = express.Router()

router.use(allRolesAuthorization);
router.get('/',punchInOutController.getAllPunchInOut);
router.get('/punch-list/:c_id',punchInOutController.getPunchInOutList);
router.get('/work-progress',punchInOutController.getPunchInOutByCompanyID);
router.get('/work-completed',punchInOutController.getPunchInOutCompletedByCompanyID);
router.get('/:id', punchInOutController.getPunchInOutById);
router.get('/punch-details/:user_id', punchInOutController.getPunchInOutByUserId);
router.post('/', punchInOutController.createPunchInOut);
router.patch('/', punchInOutController.updatePunchInOut);
router.delete('/:id', punchInOutController.deletePunchInOut);


module.exports = router;