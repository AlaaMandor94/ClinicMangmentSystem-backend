const mongoose = require("mongoose");
const stripe = require("stripe")("sk_test_51MYmKEKRu4D4e0ovwJk7CNhg3Lj1ov5Ox0SBPQIYwxCrXRimvxxi7APbLPIwV6tEDzMXOYbYAe3SY1qOnNrP4pap00DEe6ffec");
// const stripe = Stripe(process.env.STRIPE_KEY_SECRET);
const errorResponse = require("../Middelwares/errorValidation");
require("../Models/patientModel");

const invoiceSchema = require("./../Models/invoiceModel");
const patientSchema = mongoose.model("patientModel");
const paymentSchema = require("./../Models/paymentModel");

// Add a new payment
exports.pay = async (request, response, next) => {
  let invoice = await invoiceSchema.findOne({ _id: request.params.id });
  if (!invoice) {
    return response.status(404).send({ error: "Invoice not found" });
  }
  let amount = request.body.amount;
  if (amount > invoice.totalDue) {
    return response.status(400).send("Amount paid exceeds total due");
  }

  console.log("This is the patient:",invoice.patientId);
  let patientData = await patientSchema.findOne({_id: invoice.patientId})
  const card_number = request.body.card_number;
  const exp_month = request.body.exp_month;
  const exp_year = request.body.exp_year;
  const cvc = request.body.cvc;

  const param = {};
  param.card = {
    number: card_number,
    exp_month,
    exp_year,
    cvc,
  };

  try {
    const token = await stripe.tokens.create(param);
    const customer = await stripe.customers.create({
      metadata: {
        card_number,
        exp_month,
        exp_year,
        cvc,
      },
      email: patientData.email,
      source: token.id,
      name: `${patientData.fname} ${patientData.lname}`,
      address: {
        line1: patientData.address.street,
        city: patientData.address.city,
        state: patientData.address.city,
      },
    });
    await stripe.charges.create({
      amount: amount * 100,
      description: "clinic service",
      currency: "USD",
      customer: customer.id,
    });
    invoice.paid += amount;
    invoice.totalDue = invoice.total - invoice.paid;
    invoice.status = invoice.paid === invoice.total ? "paid" : "partial";
    invoice.paymentMethod = "Credit Card";
    await invoice.save();

    let newPayment = paymentSchema({
      amount: amount,
      card_number: card_number,
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: cvc,
      email: patientData.email,
    });

    await newPayment.save();
    response.send({ message: "Payment added successfully" });
  } catch (error) {
    response.status(500).send({ error: error });
  }
};
