const mongoose = require("mongoose");

require("../Models/invoiceModel");
require("../Models/patientModel");
require("../Models/ClinicModel");
require("../Models/prescriptionModel");
require("../Models/medicineModel");
require("../Models/invoiceDataModel");
require("../Models/employeeModel");
const InvoiceSchema = mongoose.model("invoice");
const clinicSchema = mongoose.model("clinic");
const prescriptionSchema = mongoose.model("prescription");
const medicineSchema = mongoose.model("medicine");
const invoiceDataSchema = mongoose.model("invoiceData");
const patientSchema = mongoose.model("patientModel");
const doctorSchema = require("../Models/doctorsModel");
const employeeSchema = mongoose.model("employee");

exports.getAllInvoices = (request, response, next) => {
  let query;
  //copy requset query
  const reqQuery = { ...request.query };
  //field to exclude
  const removeField = ["select", "sort"];
  //loop over removeField and delete the from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);
  //create query string
  let queryStr = JSON.stringify(reqQuery);
  //create operator
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  query = InvoiceSchema.find(JSON.parse(queryStr));
  if (request.query.select) {
    const fields = request.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //sort
  if (request.query.sort) {
    const sortBy = request.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("_id");
  }

  InvoiceSchema.find()
    .populate({ path: "patientId" })
    .populate({ path: "clinicId" })

    .then((data) => {
      response.status(200).json(data);
    })
    .catch((error) => next(error));
};
exports.addInvoice = async (request, response, next) => {
  try {
    const clinic = await clinicSchema.findOne({ _id: request.body.clinicId });
    if (!clinic) return response.status(400).json({ error: "Clinic not found" });

    let patient = await patientSchema.findOne({ _id: request.body.patientId });
    if (!patient) return response.status(400).json({ error: "Patient not found" });
    let Discount = 0;
    const patientType = request.body.patientType;
    switch (patientType) {
      case "doctor":
        Discount = 0.7;
        break;
      case "employee":
        Discount = 0.75;
        break;
      default:
        Discount = 1;
        break;
    }
    ///////
    let prescription = [];
    let product = [];
    prescription = await prescriptionSchema.find({ patientId: request.body.patientId });
    let totalCost = 0;
    for (const element of prescription) {
      let doctor = await doctorSchema.findOne({ _id: element.doctorId });
      let doctorPrice = doctor.vezeeta * Discount;
      product.push({ name: `${doctor.firstName} ${doctor.lastName}`, price: doctorPrice, Quantity: 1, totalPrice: doctorPrice });

      totalCost += doctorPrice;
    }
    let paymentMethod = request.body.paymentMethod || "Cash";
    if (paymentMethod !== "Cash" && paymentMethod !== "Credit Card" && paymentMethod !== "Insurance Card") {
      return response.status(400).json({ error: "Payment method not accepted" });
    }
    let paid = request.body.paid || 0;
    let invoiceStatus = "unpaid";
    let totalDue = totalCost;
    if (paid > totalCost) {
      return response.status(400).json({ error: "Paid amount is greater than total cost" });
    } else if (paid === totalCost) {
      invoiceStatus = "paid";
      totalDue = 0;
    } else {
      invoiceStatus = "partial";
      totalDue = totalCost - paid;
    }

    let now = new Date();
    let newInvoice = await new InvoiceSchema({
      _id: request.body.id,
      patientId: request.body.patientId,
      patientModel: request.body.patientType,
      clinic_Id: request.body.clinicId,
      invoiceDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
      invoiceTime: `${now.getHours()}:${now.getMinutes()}`,
      status: invoiceStatus,
      total: totalCost,
      paymentMethod: paymentMethod,
      paid: paid,
      totalDue: totalDue,
    });
    await newInvoice.save();

    let date = new Date();
    let dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let data = new invoiceDataSchema({
      _id: request.body.id,
      clinicAddress: {
        name: `${clinic.name}-${clinic._id}`,
        city: clinic.address && clinic.address.city,
        street: clinic.address && clinic.address.street,
      },
      clientAddress: {
        name: `${patient.fname} ${patient.lname}`,
        city: patient.address && patient.address.city,
        street: patient.address && patient.address.street,
      },
      invoiceNumber: newInvoice._id,
      invoiceDate: newInvoice.invoiceDate,
      invoiceDueDate: `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}-${dueDate.getDate()}`,
      products: product,
    });
    await data.save();

    response.status(200).json({
      status: "Invoice Added and Saved to File",
      invoice: newInvoice,
      invoiceData: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInvoice = (request, response, next) => {
  InvoiceSchema.updateOne(
    {
      _id: request.body.id,
    },
    {
      $set: {
        paymentMethod: request.body.paymentMethod,
        paid: request.body.paid,
      },
    }
  )
    .then((result) => {
      if (result.matchedCount != 0) {
        response.status(200).json({ message: "updated" });
      } else {
        next(new Error("invoice doesn't Exist"));
      }
    })
    .catch((error) => next(error));
};

exports.getInvoiceByID = (request, response, next) => {
  InvoiceSchema.findOne({ _id: request.params.id })
    .populate({ path: "patientId" })
    .populate({ path: "clinicId" })
    .then((data) => {
      if (data != null) {
        response.status(200).json(data);
      } else {
        next(new Error("invoice doesn't Exist"));
      }
    })
    .catch((error) => next(error));
};

exports.deleteInvoiceByID = (request, response, next) => {
  InvoiceSchema.findByIdAndDelete({ _id: request.params.id })
    .then((data) => {
      if (data != null) {
        response.status(200).json({ message: "deleted" });
      } else {
        next(new Error("invoice doesn't Exist"));
      }
    })
    .catch((error) => next(error));
};

exports.getInvoiceByPatientId = (request, response, next) => {
  InvoiceSchema.find({ patientId: request.params.id })
    .populate({ path: "doctorId", select: ["firstName", "lastName"] })
    .populate({ path: "clinicId", select: ["name"] })
    .then((result) => {
      if (result != null) {
        response.status(200).json(result);
      } else {
        next(new Error("Invoice doesn't exist for this patient"));
      }
    })
    .catch((error) => {
      next(error);
    });
};
