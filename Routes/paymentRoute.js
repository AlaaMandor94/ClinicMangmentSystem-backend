const express = require("express");
const paymentController = require("../Controllers/paymentController");

const validatorAuth = require("../Middelwares/authValidation");
const validatePayment = require("../Middelwares/paymentValidator");
const validator = require("./../Middelwares/errorValidation");
const router = express.Router();

router.route("/payment/:id").post(validatePayment, validator, validatorAuth.checkAdminPatient, paymentController.pay);

module.exports = router;