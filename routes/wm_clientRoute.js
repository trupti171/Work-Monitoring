const express=require('express');
const clientController=require('../controller/wm_clientController');
const { allRolesAuthorization }=require('../middleware/auth');

const router = express.Router()

router.use(allRolesAuthorization);
router.get('/',clientController.getAllClient);
router.get('/client-list/:c_id',clientController.getClientList);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.patch('/', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);


module.exports = router;