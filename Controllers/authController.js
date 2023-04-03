const { request, response, json } = require("express");
const mongoose = require("mongoose");
require("../Models/authModel");
require("../Models/patientModel");
require("../Models/doctorsModel");
require("../Models/employeeModel");
require("../Models/emailModel");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.model("authModel");
const patientSchema = mongoose.model("patientModel");
const doctorSchema = mongoose.model("doctors");
const empSchema = mongoose.model("employee");
const emailSchema = mongoose.model("email");

exports.getAllEmails = (request, response, next) => {
  emailSchema
    .find()
    .then((data) => {
      response.status(200).json(data);
    })
    .catch((error) => next(error));
};

exports.register = async (request, response, next) => {
  try {
    const {
      fname,
      lname,
      age,
      telephone,
      gender,
      email,
      password,
      role,
      address: { city, street, building },
      salary,
      specialty,
      vezeeta,
      clinicId,
    } = request.body;

    const userEmail = await emailSchema.findOne({ email: request.body.email });
    if (userEmail) return response.status(400).json({ error: "Duplicated Email" });

    firstName = fname;
    lastName = lname;
    clinic = clinicId;
    empAge = age;
    empGender = gender;
    // empEmail=email;
    // empPassword=password;
    empSalary = salary;
    empPhone = telephone;

    switch (role) {
      case "Patient":
        patientSchema.create({
          fname,
          lname,
          age,
          telephone,
          gender,
          email,
          password,
          role,
          address: {
            city,
            street,
            building,
          },
        });
        emailSchema.create({
          email,
        });
        break;
      case "Doctor":
        doctorSchema.create({
          firstName,
          lastName,
          age,
          telephone,
          gender,
          email,
          password,
          role,
          address: {
            city,
            street,
            building,
          },
          vezeeta,
          salary,
          clinic,
          specialty,
        });
        emailSchema.create({
          email,
        });
        break;
      case "Employee":
        empSchema.create({
          firstName,
          lastName,
          empAge,
          empPhone,
          empGender,
          email,
          password,
          role,
          address: {
            city,
            street,
            building,
          },
          clinicId,
          empSalary,
        });
        emailSchema.create({
          email,
        });
        break;
      case "Admin":
        const user = await userSchema.create({
          fname,
          lname,
          age,
          telephone,
          gender,
          email,
          password,
          role,
          address: {
            city,
            street,
            building,
          },
          salary,
          specialty,
          vezeeta,
          clinicId,
        });
        emailSchema.create({
          email,
        });
        break;
      default:
        break;
    }
    response.status(200).json({ success: "Success Registration" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      response.status(400).json({ ErrorMessage: "Please Enter Your Email and Password" });
    }
    // const user = await userSchema.findOne({ email }).select('+password');
    // if (!user) {
    //     response.status(401).json({ ErrorMessage: 'Invalid Email' })
    // }
    // const isMatch = await user.comparePassword(password);
    // if (!isMatch) {
    //     response.status(401).json({ ErrorMessage: 'Invalid Password' })
    // } else {
    //     let token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
    //     if (user.role == 'Doctor') {
    //         response.status(200).json({ success: "Doctor", token: token });
    //     } else if (user.role == 'Patient') {
    //         response.status(200).json({ success: "Patient", token: token,_id:user._id });
    //     } else if (user.role == 'Employee') {
    //         response.status(200).json({ success: "Employee", token: token });
    //     } else if (user.role == 'Admin') {
    //         response.status(200).json({ success: "Admin", token: token });
    //     }
    const patient = await patientSchema.findOne({ email }).select("+password");
    const employee = await empSchema.findOne({ email }).select("+password");
    const doctor = await doctorSchema.findOne({ email }).select("+password");
    const admin = await userSchema.findOne({ email }).select("+password");

    const isMatchPatient = patient ? await patient.comparePassword(password) : false;
    const isMatchEmployee = employee ? await employee.comparePassword(password) : false;
    const isMatchDoctor = doctor ? await doctor.comparePassword(password) : false;
    const isMatchAdmin = admin ? await admin.comparePassword(password) : false;
    console.log(patient);

    if (patient && isMatchPatient) {
      let token = jwt.sign({ id: patient._id, role: patient.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
      response.status(200).json({ success: "Patient", token: token, _id: patient._id });
    } else if (employee && isMatchEmployee) {
      let token = jwt.sign({ id: employee._id, role: employee.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
      response.status(200).json({ success: "Employee", token: token, _id: employee._id });
    } else if (doctor && isMatchDoctor) {
      let token = jwt.sign({ id: doctor._id, role: doctor.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
      response.status(200).json({ success: "Doctor", token: token, _id: doctor._id });
    } else if (admin && isMatchAdmin) {
      let token = jwt.sign({ id: admin._id, role: admin.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
      response.status(200).json({ success: "Admin", token: token, _id: admin._id });
    }
  } catch (error) {
    next(error);
  }
};

// exports.myInfo = async (request,response,next)=>{
//     const user = await userSchema.findById(request.user.id);
//     request.status(200),json({Data:userSchema})
// }
