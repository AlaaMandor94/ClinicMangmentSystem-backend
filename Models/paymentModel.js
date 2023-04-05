const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  invoice_id: {
    type: String,
    ref: "invoice",
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  card_number: {
    type: String,
    required: [true, "Card number is required"],
  },
  exp_month: {
    type: Number,
    required: [true, "Expiration month is required"],
  },
  exp_year: {
    type: Number,
    required: [true, "Expiration year is required"],
  },
  cvc: {
    type: Number,
    required: [true, "CVC is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;