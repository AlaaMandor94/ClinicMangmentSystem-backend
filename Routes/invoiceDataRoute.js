const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const controller = require("./../Controllers/invoiceDataController");
const validator = require("./../Middelwares/errorValidation");
const validatorAuth = require("../Middelwares/authValidation");
const router = express.Router();

router.route("/invoiceData").get(controller.getAllInvoiceData).post(validator, controller.addinvoiceData);

router.route("/invoiceData/:id").delete(param("id").isInt().withMessage("id should be integer"), validator, controller.deleteInvoiceDataByID);
router.route("/invoiceData").get(controller.getAllInvoiceData).post(validator, controller.addinvoiceData);

router
  .route("/invoiceData/:id")
  .delete(param("id").isInt().withMessage("id should be integer"), validator, controller.deleteInvoiceDataByID)

  .get(param("id").isInt().withMessage("id should be integer"), validator, controller.getInvoiceDataByID);

router.get("/invoiceData/:id", param("id").isInt().withMessage("id should be integer"), validator, controller.getInvoiceDataByID);

module.exports = router;
