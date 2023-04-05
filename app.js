const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

// routes
const employeeRoute = require("./Routes/employeeRoute");
const prescriptionRote = require("./Routes/prescriptionRoute");
const appointmentRoute = require("./Routes/appointmentRoute");
const doctorsRoute = require("./Routes/doctorsRoute");
const clinicRouter = require("./Routes/ClinicRouter");
const medicineRouter = require("./Routes/medicineRouter");
const patientRouter = require("./Routes/patientRoute");
const authRoute = require("./Routes/authRoute");
const authMW = require("./Middelwares/authValidation");
const invoiceRouter = require("./Routes/invoiceRoute");
const paymentRouter = require("./Routes/paymentRoute");
const reportsRouter = require("./Routes/reportsRoute");
const invoiceDataRouter = require("./Routes/invoiceDataRoute");

require("dotenv").config();

// connecting DB ........
console.log(process.env.DB_URL);
const DB_URL = process.env.DB_URL;

let port = process.env.PORT || 3000;
mongoose.set("strictQuery", true);
mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("DB Connected ...");
    app.listen(port, () => {
      console.log("I am listening..............", port);
    });
  })
  .catch((error) => {
    console.log("Bb Problem" + error);
  });

//1) Middle ware.......
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
//2)Routes Middle ware.......
app.use(clinicRouter);
app.use(medicineRouter);

app.use(authRoute);
app.use(authMW);
app.use(employeeRoute);
app.use(prescriptionRote);
app.use(appointmentRoute);
app.use(doctorsRoute);
app.use(patientRouter);
app.use(invoiceRouter);
app.use(paymentRouter);
app.use(reportsRouter);
app.use(invoiceDataRouter);
//Not Found MiddleWare
app.use((request, response, next) => {
  response.status(404).send("page not found");
});
// Error MiddleWare
app.use((error, request, response, next) => {
  response.status(500).json({ message: "Error " + error });
});
