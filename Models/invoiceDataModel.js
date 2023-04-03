const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

//Schema for Address
const AddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String },
    street: { type: String },
  },
  { _id: false }
);
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number },
    Quantity: { type: Number },
    totalPrice: { type: Number },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    _id: { type: Number },
    clinicAddress: AddressSchema,
    clientAddress: AddressSchema,
    invoiceNumber: { type: Number },
    invoiceDate: {
      type: String, //"2016-11-05" date formate
      get: (date) => {
        return date.split("T")[0];
      },
      required: [true, " Date for appointment is required"],
      default: Date.now(),
    },
    invoiceDueDate: {
      type: String, //"2016-11-05" date formate
      get: (date) => {
        return date.split("T")[0];
      },
      required: [true, " Date for appointment is required"],
      default: Date.now(),
    },
    products: [productSchema],
  },
  { _id: false }
);

schema.plugin(AutoIncrement, { id: "data_id_counter", inc_field: "_id" });

//mapping: binding Schema with collection
module.exports = mongoose.model("invoiceData", schema);
