const mongoose = require("mongoose");

const fs = require("fs");
const easyinvoice = require("easyinvoice");

require("../Models/invoiceModel");
const InvoiceSchema = mongoose.model("invoice");
require("../Models/patientModel");
require("../Models/ClinicModel");
require("../Models/prescriptionModel");
require("../Models/medicineModel");
const patientSchema = mongoose.model("patientModel");
const clinicSchema = mongoose.model("clinic");
const prescriptionSchema = mongoose.model("prescription");
const medicineSchema =  mongoose.model("medicine");




const doctorSchema = require("../Models/doctorsModel");

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

    let patient = await patientSchema.findOne({
      _id: request.body.patientId,
    });
    if (!patient) return response.status(400).json({ error: "Patient not found" });

    ///////
    const prescription = await prescriptionSchema.findOne({ patientId: request.body.patientId });
    const doctor = await doctorSchema.findOne({ _id: prescription.doctorId });
    doctorPrice = doctor.vezeeta;
    medicinePrice = 0;
    prescription.medicineId.forEach((element) => {
      medicineSchema.findOne({ _id: element }).then((result) => {
        medicinePrice += result.price;
      });
    });

    let totalCost = doctorPrice + medicinePrice;
    let paymentMethod = "Cash";
    if (request.body.paymentMethod) {
      paymentMethod = request.body.paymentMethod;
      if (paymentMethod !== "Cash" && paymentMethod !== "Credit Card" && paymentMethod !== "Insurance Card") {
        return response.status(400).json({ error: "Payment method not accepted" });
      }
    }
    let paid = 0;
    let totalDue = totalCost;
    let invoiceStatus = "unpaid";
    if (request.body.paid) {
      paid = request.body.paid;
      if (paid > totalCost) {
        return response.status(400).json({ error: "Paid amount is greater than total cost" });
      } else if (paid === totalCost) {
        invoiceStatus = "paid";
        totalDue = 0;
      } else {
        invoiceStatus = "partial";
        totalDue = totalCost - paid;
      }
    }
    const now = new Date();
    let newInvoice = new InvoiceSchema({
      _id: request.body.id,
      patient_Id: request.body.patientId,
      clinic_Id: request.body.clinicId,
      invoiceDate: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      invoiceTime: `${now.getHours()}:${now.getMinutes()}`,
      status: invoiceStatus,
      total: totalCost,
      paymentMethod: paymentMethod,
      paid: paid,
      totalDue: totalDue,
    });
    await newInvoice.save();

    const date = new Date();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    console.log(newInvoice)
    let data = {
      currency: "USD",
      taxNotation: "vat",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      settings: { locale: "en-US", currency: "USD" },
      sender: {
        company: `Alwafaa-${clinic.name}-${clinic._id}`,
        address: clinic.address.street,
        city: clinic.address.city,
      },
      client: {
        company: patient.fname + " " + patient.lname,
        address: patient.address.street,
        city: patient.address.city,
      },
      images: {
        logo: "https://seeklogo.com/images/H/hospital-clinic-plus-logo-7916383C7A-seeklogo.com.png",
      },

      information: {
        number: newInvoice._id,
        date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
        "due-date": `${dueDate.getDate()}/${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`,
      },
      products: [{
        description: "Total price",
        "tax-rate": 14,
        price: totalDue,
      }],
      "bottom-notice": "Kindly pay your invoice within 30 days.",
    };
    // const invoicePdf = async () => {
    //   let result = await easyinvoice.createInvoice(data);
    //   fs.writeFile(`invoices/${newInvoice._id}.pdf`, result.pdf, "base64", function (error) {
    //     if (error) {
    //       next(error);
    //     }
    //   });
    // };
    
    // await invoicePdf();

    const createInvoicePdf = async (data, invoiceId) => {
      try {
        const invoice = await easyinvoice.createInvoice(data);
        const filePath = `invoices/${invoiceId}.pdf`;
        fs.writeFile(filePath, invoice.pdf, { encoding: 'base64' }, (err) => {
          if (err) {
            console.error('Error saving invoice PDF:', err);
            throw err;
          }
        });
      } catch (err) {
        console.error('Error generating invoice PDF:', err);
        throw err;
      }
    };
    await createInvoicePdf();
    response.status(200).json({
      status: "Invoice Added and Saved to File",
      invoice: newInvoice,
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
        prescription: request.body.prescription,
        invoiceDate: request.body.invoiceDate,
        invoiceTime: request.body.invoiceTime,
        status: request.body.status,
        receptionist: request.body.receptionist,
        paymentMethod: request.body.paymentMethod,
        totalPaid: request.body.totalPaid,
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
    .populate({ path: "prescription" })
    .populate({ path: "receptionist" })
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