const { body, query, param, validationResult } = require("express-validator");
let paymentValidator = [
  body("amount").isInt().not().isEmpty().withMessage("Amount is required").isNumeric().withMessage("Amount must be a number"),
  body("card_number").isInt().not().isEmpty().withMessage("Card number is required"),
  body("exp_month").not().isEmpty().withMessage("Expiration month is required").isNumeric().withMessage("Expiration month must be a number"),
  body("exp_year").not().isEmpty().withMessage("Expiration year is required").isNumeric().withMessage("Expiration year must be a number"),
  body("cvc").isInt().not().isEmpty().withMessage("CVC is required").isNumeric().withMessage("CVC must be a number"),
];

module.exports = paymentValidator;
