const express = require('express');

const resetpasswordController = require('../controllers/resetpassword');

const router = express.Router();

router.get('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword)

router.get('/resetpassword/:id', resetpasswordController.resetpassword)

router.use('/forgotpassword', resetpasswordController.forgotpassword)

module.exports = router;

//API_KEY = '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'