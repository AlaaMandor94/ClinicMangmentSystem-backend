const doctorModel = require("./../Models/doctorsModel");
const paientModel = require("./../Models/patientModel");
const mongoose = require("mongoose");
//const sharp = require("sharp")// this pakage for resize image to fit
const sharp = require("sharp");
//get clicinc model to ensure that this clinic is already exsisting
require("./../Models/ClinicModel");
const clinicSchema = mongoose.model("clinic");
const jwt = require("jsonwebtoken");
//image multer ...................
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/doctor");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `doctor-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

// const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // CHECK IF THE UPLODED FILE IS image OR NOT
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, please uplode only images "), false);
  }
};

//rezize
// exports.resizeImage = async(req, res, next) => {
//     const filename = `doctor-${Date.now()}.jpeg`;
//     console.log(req.file)

//     if (req.file) {
//         await sharp(req.file.buffer).resize(600, 600)
//             .toFormat("jpeg").toFile(`public/img/doctor/${filename}`)
//         req.body.image = filename;
//     }

//     next();
// }

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadDoctorImg = upload.single("image");

//resize Photo Image
// exports.resizeDoctorImage = (req, res, next) => {
//     if (!req.file) return next();
//     req.file.filename = `${req.params.id }-${Date.now()}.jpeg`

//     sharp(req.file.buffer)
//         .resize(600, 600)
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toFile(`./public/img/doctor${req.file.filename}`)
//     next();

// }

exports.getAllDoctors = async (req, res, next) => {
  try {
    // filtring
    //console.log(req.query.sort)
    const queryObj = { ...req.query };
    const excludedFieleds = ["page", "sort", "limit", "fields", "select"];

    //  filtering gte|gt|lt
    let queryStr = JSON.stringify(queryObj); //we made stringify here to change js object to string to use .replcae function on the string

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    console.log("After replace", queryStr);
    excludedFieleds.forEach((el) => delete queryObj[el]);

    let query = doctorModel
      .find(JSON.parse(queryStr))
      .populate({ path: "clinic", select: ["name", "department", "address"] })
      .populate({ path: "appointments" }); //path==>name of field and ref:=>>name of schema
    // sorting .......................
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
      console.log(sortBy);
    }

    // Excute Query
    const doctors = await query;
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const doctor = await doctorModel
      .findById(id)
      .populate({
        path: "clinic",
        select: ["_id", "name", "department", "address"],
      })
      .populate({
        path: "appointments",
        populate: {
          path: "patient",
          //model: 'paientModel'
        },
      });
    // .populate({ path: 'appointments', select: ['date', "time", "patient"] })
    //.populate({ path: 'appointments.patient' }); // Populates the 'patient' field in the 'appointments' array with selected fields
    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

exports.addNewDoctor = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = req.file.filename;
    }

    const { clinic } = req.body;
    console.log("BodyValue =", req.body);
    console.log("clicin _id=", clinic);
    const exsistingClinci = await clinicSchema.findOne({ _id: clinic });
    console.log("exsistingClinci =", exsistingClinci);
    if (!exsistingClinci) {
      return res
        .status(400)
        .json({ error: "Can not assign doctor to NoneExsisting clinic" });
    }
    if (emailschema.findOne((a) => a.email == req.body.email)) {
        next({message:"Email already exist"});
    }
    const newDoctor = await doctorModel.create(req.body);
    res.status(201).json({
      status: "add new doctor succesed ",
      data: {
        newDoctor,
      },
    });
  } catch (error) {
    if (error.code == 11000) {
      const dublicatedFiled = Object.keys(error.keyValue)[0];
      res.status(400).json({
        status: "fail",

        message: ` this ${dublicatedFiled} is Already Exsist `,
      });
    } else {
      next(error.message);
    }
    email = request.body.email;
    if (email) {
      emailSchema.create({
        email,
      });
    }
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    // if (!req.file) return next();
    // console.log(req.file)
    // console.log(req.params)

    // req.body.image = req.file.filename

    const { id } = req.params;
    const updateDoctor = await doctorModel.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //The { new: true } option in the options object tells Mongoose to return the updated document instead of the original document.

    if (updateDoctor != null) {
      res.status(200).json({
        status: "update Doctor succesed ",
        data: {
          updateDoctor,
        },
      });
    } else {
      next(new Error("Doctor doesn't exist"));
    }
  } catch (error) {
    next(error);
  }
  email = request.body.email;
  if (email) {
    emailSchema.create({
      email,
    });
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteDoctor = await doctorModel.findByIdAndDelete(id); //The { new: true } option in the options object tells Mongoose to return the updated document instead of the original document.

    if (deleteDoctor != null) {
      res.status(204).json({
        status: "delete Doctor succesed ",
        data: {
          deleteDoctor,
        },
      });
    } else {
      next(new Error("Doctor doesn't exist"));
    }
  } catch (error) {
    next(error);
  }
};

// exports.login = async(request,response,next)=>{
//     const {email,password} = request.body;
//     if(!email || !password)
//     {
//         response.status(400).json({ErrorMessage:'Please Enter Your Email and Password'})
//     }
//     const user = await userSchema.findOne({email}).select('+password');
//     if(!user)
//     {
//         response.status(401).json({ErrorMessage:'Invalid Email'})
//     }
//     const isMatch = await user.comparePassword(password);
//     if(!isMatch)
//     {
//         response.status(401).json({ErrorMessage:'Invalid Password'})
//     }
//     else
//     {
//         let token= jwt.sign({id:user._id,role:user.role},process.env.SECRET_KEY,{expiresIn:"1h"});
//         if(user.ole=='Doctor')
//         {
//             response.status(200).json({success:"Doctor",token:token});
//         }
//         else
//         {
//             response.status(403).json({success:"failed"});
//         }

//     }
// };
