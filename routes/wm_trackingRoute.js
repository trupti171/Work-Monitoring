const express=require('express');
const trackingController=require('../controller/wm_trackingController');
const { allRolesAuthorization }=require('../middleware/auth');

const router = express.Router()

router.use(allRolesAuthorization);
router.get('/',trackingController.getAllTracking);
router.get('/machine-status',trackingController.getTrackingMachineStatus);
router.get('/reports',trackingController.getTrackingDataBetweenDates);
router.get('/work-progress-userID',trackingController.getTrackingProgessByEmpId);
router.get('/work-progress-machineID',trackingController.getTrackingProgessByMachineId);
router.get('/dash-board-progress-deptID',trackingController.getTrackingProgessForDashBoard);
router.get('/work-progress',trackingController.getTrackingProgessByEmpIdAndCompanyID);
router.get('/work-completed',trackingController.getTrackingCompletedByEmpIdAndCompanyID);
router.get('/tracking-list/:c_id',trackingController.getTrackingList);
router.get('/tracking-machine-list/:u_id',trackingController.getTrackingMachineList);
router.get('/tracking-work-list/:u_id/:m_id',trackingController.getTrackingWorkList);
router.get('/:id', trackingController.getTrackingById);
router.post('/track-machine',trackingController.getTrackingMachine);
router.post('/logout-user',trackingController.getTrackingNewUserMachine);
router.post('/work-tracking-pdf',trackingController.createWorlTrackingPdf);
// router.post('/work-tracking-list',trackingController.createWorkTrackingList);
router.post('/', trackingController.createTracking);
router.post('/work-start', trackingController.createTrackWorkStart);
router.patch('/', trackingController.updateTracking);
router.patch('/work-stop', trackingController.updateWorkStop);
router.patch('/work-complete-qty-count', trackingController.updateWorkCompletedQuantity);
router.delete('/:id', trackingController.deleteTracking);


module.exports = router;