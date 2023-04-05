const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const controller = require("./../Controllers/invoiceController");
const validator = require("./../Middelwares/errorValidation");
const validatorAuth = require("../Middelwares/authValidation");
const invoiceValidator = require("./../Middelwares/invoiceValidator");
const router = express.Router();

router
  .route("/invoice")
  .get(validatorAuth.checkAdminPatient, 
    controller.getAllInvoices)
  .post(invoiceValidator, validator, validatorAuth.checkAdminEmployee, controller.addInvoice)
  .patch(body("id").isInt().withMessage("id should be integer"), validator, validatorAuth.checkAdminEmployee, controller.updateInvoice);

router.delete(
  "/invoice/:id",
  param("id").isInt().withMessage("id should be integer"),
  validator,
  validatorAuth.checkAdminEmployee,
  controller.deleteInvoiceByID
);

router.get(
  "/invoice/:id",
  param("id").isInt().withMessage("id should be integer"),
  validator,
  validatorAuth.checkAdminEmployee,
  controller.getInvoiceByID
);

//to get prescription for  a specific patient
router.get(
  "/patientInvoices/:id",
  param("id").isInt().withMessage("patient id should be intger"),
  validator,
  validatorAuth.checkAdminPatient,
  controller.getInvoiceByPatientId
);

module.exports = router;
