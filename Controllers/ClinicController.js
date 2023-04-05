const { request, response } = require("express");
const { body } = require("express-validator");
const mongoose = require("mongoose");
const { param } = require("./../Routes/ClinicRouter");
require("./../Models/ClinicModel");
const clinicSchema = mongoose.model("clinic");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, "public/img/clinic");
  },
  filename: (request, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const fileFilter = (request, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mintype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
});

exports.uploadClinicImg = upload.single("image");

exports.getAllClinic = (request, response, next) => {
  let query;
  // copy request query
  const reqQuery = { ...request.query };
  // field to exclude
  const removeFields = ["select", "sort"];
  //loop over removeField and delete the from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);
  //create operator ($gt,gte,lt,lte,in)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  // find resource
  query = clinicSchema.find(JSON.parse(queryStr));
  //select field
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
  clinicSchema
    .find()
    .populate({
      path: "doctor",
      populate: {
        path: "appointments",
        populate: {
          path: "patient",
        },
      },
      //select: ["firstName", "lastName", "email", "age", "gender"],
    })
    .then((data) => {
      response.status(200).json(data);
    })
    .catch((error) => {
      next(error);
    });
};
exports.addClinic = async (request, response, next) => {
  let image;
  if (!request.file) {
    image = request.file.filename;
  }
  console.log(request.file);
  let ClinicObject = await new clinicSchema({
    name: request.body.name,
    department: request.body.department,
    address: request.body.address,
    doctor: request.body.doctor,
    telephoneNumber: request.body.telephoneNumber,
    image: request.file.filename,
  });
  ClinicObject.save()
    .then((data) => {
      response.status(201).json(data);
    })
    .catch((error) => {
      next(error);
    });
};
exports.updateClinic = (request, response, next) => {
  let image;
  if (!request.file) {
    image = request.file.filename;
  }
  clinicSchema
    .updateOne(
      { _id: request.body.id },
      {
        $set: {
          name: request.body.name,
          department: request.body.department,
          address: request.body.address,
          doctor: request.body.doctor,
          telephoneNumber: request.body.telephoneNumber,
          image: request.filename.filename,
        },
      }
    )
    .then((data) => {
      if (data.modifiedCount == 0) throw new Error("clinic not found");
      response.status(200).json({ message: "update" });
    })
    .catch((error) => {
      next(error);
    });
};
exports.deleteClinic = (request, response) => {
  clinicSchema
    .findOneAndRemove({ _id: request.body.id })
    .then((result) => {
      if (!result) {
        response.status(400).json({ message: "not found" });
      } else {
        response.status(200).json({ message: "delete" });
      }
    })
    .catch((error) => {
      next(error);
    });
};

exports.getClinicID = async (request, response, next) => {
  try {
    const { id } = request.params;
    const clinic = await clinicSchema.findById(id).populate({
      path: "doctor",
      select: ["firstName", "lastName"],
      populate: {
        path: "appointments",
        select: ["patient", "date", "time"],
        populate: {
          path: "patient",
          select: ["Fname", "Lname"],
        },
      },
      //select: ["firstName", "lastName", "email", "age", "gender"],
    });
    response.status(201).json(clinic);
  } catch (error) {
    next(error);
  }
};
