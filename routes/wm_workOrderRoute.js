const express = require('express');
const multer = require("multer");
const workOrderController = require('../controller/wm_workOrderController');
const { allRolesAuthorization } = require('../middleware/auth');

const router = express.Router()

const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage }); // Use the memory storage in the upload middleware

router.use(allRolesAuthorization);
router.get('/', workOrderController.getAllWorkOrder);
router.get('/company-orderid', workOrderController.getAllWorkOrderByCIdAndWoId);
router.get('/workorder-list/:c_id', workOrderController.getWorkOrderList);
router.get('/based-work-order-number/:work_order_numb', workOrderController.getWorkOrderByWorkOrderNumber);
router.get('/work-order-number-list', workOrderController.getWorkOrderByWorkOrderNumberList);
router.get('/:id', workOrderController.getWorkOrderById);
router.get('/workorder-list/based-department/:dId', workOrderController.getWorkOrderListByDeptId);
router.post('/many-user', workOrderController.createManyWorkOrder);
router.post('/', workOrderController.createWorkOrder);
router.patch('/', upload.fields([{ name: "qrcode_img" }]), workOrderController.updateWorkOrder);
router.delete('/:id', workOrderController.deleteWorkOrder);


module.exports = router;