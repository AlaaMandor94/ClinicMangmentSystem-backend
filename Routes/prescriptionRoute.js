const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
// import controller
const controller = require("./../Controllers/prescriptionController");
// import validators
const validator = require("./../Middelwares/errorValidation");
const prescriptionValidator = require("./../Middelwares/prescriptionValidation");
const validatorAuth = require("../Middelwares/authValidation");
const router = express.Router();

router
    .route("/prescription")
    .get(validatorAuth.checkAdminDoctor, controller.getAllPrescription)
    .post(prescriptionValidator, validator, validatorAuth.checkAdminDoctor, controller.addPrescription)
    .patch(
        body("id").isInt().withMessage("Id should be integer"),
        validator,
        validatorAuth.checkAdminDoctor,
        controller.updatePrescription
    )


router
    .route("/prescription/:id")
    .get(param("id").isInt().withMessage("Id should be integer"), validator, validatorAuth.checkAdminDoctor, controller.getPrescriptionById)
    .delete(param("id").isInt().withMessage("Id should be integer"), validator, validatorAuth.checkAdminDoctor, controller.deletePrescription)

//to get prescription for  aspecifc doctor
router.get("/doctorPrescriptions/:id",
    param("id").isInt().withMessage("doctor id should be intger"),
    validator,
    validatorAuth.checkAdminDoctor,
    controller.getPrescriptionByDoctorId);

module.exports = router;