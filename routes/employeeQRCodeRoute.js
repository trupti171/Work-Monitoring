const express = require('express');
const router = express.Router();
const { qrCodeGenerator } = require('../controller/wm_userController');

router.post('/', qrCodeGenerator);

module.exports = router;