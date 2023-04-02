const { body, query, param, validationResult } = require("express-validator");
let invoiceValidator = [
  body("patientId").isInt().withMessage("patient ref should be number"),
  body("clinicId").isInt().withMessage("clinic ref should be number"),
  body("paymentMethod").isIn(["Cash", "Credit Card", "Insurance Card"]).withMessage("payment method should be  Cash, Credit Card or Insurance Card"),
  body("paid").isInt(),
];

module.exports = invoiceValidator;