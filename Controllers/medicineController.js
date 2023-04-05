const { request, response } = require("express");
const mongoose = require("mongoose");
const { param } = require("./../Routes/medicineRouter");
require("./../Models/medicineModel");
const medicineSchema = mongoose.model("medicine");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, "./public/img/medicine");
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
exports.uploadMedincineImg = upload.single("image");

exports.getAllMedicine = (request, response, next) => {
  let query;
  //copy request query
  const reqQuery = { ...request.queryt };
  //field to exclude
  const removeField = ["select", "sort"];
  //loop over removeField and delete the from reqQuery
  removeField.forEach((para) => delete reqQuery[param]);
  //create query String
  let queryStr = JSON.stringify(reqQuery);
  // create operator
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  //find resource
  query = medicineSchema.find(JSON.parse(queryStr));
  //select field
  if (request.query.select) {
    const fields = request.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //sort
  if (request.query.sort) {
    const sortBy = request.query.sort.split(",").join(" ");
    query = query.sort("_id");
  }
  medicineSchema
    .find()
    .then((data) => {
      response.status(200).json({ message: "All Medicine", data });
    })
    .catch((error) => {
      next(error);
    });
};
exports.addMedicine = async (request, response, next) => {
  let image;
  if (request.file) {
    image = request.file.filename;
  }
  let medicineObject = await new medicineSchema({
    name: request.body.name,
    type: request.body.type,
    expireDate: request.body.expireDate,
    productionDate: request.body.productionDate,
    companyName: request.body.companyName,
    price: request.body.price,
    image: request.file.filename,
    quantity: request.body.quantity,
    offer: request.body.offer,
  });
  medicineObject
    .save()
    .then(() => {
      response.status(201).json({ message: "Add" });
    })
    .catch((error) => {
      next(error);
    });
};
exports.updateMedicine = (request, response, next) => {
  let image;
  if (request.file) {
    image = request.file.filename;
  }
  medicineSchema
    .updateOne(
      { _id: request.body.id },
      {
        $set: {
          name: request.body.name,
          type: request.body.type,
          expireDate: request.body.expireDate,
          productionDate: request.body.productionDate,
          companyName: request.body.companyName,
          price: request.body.price,
          image: request.filename.filename,
          quantity: request.body.quantity,
          offer: request.body.offer,
        },
      }
    )
    .then((data) => {
      if (data.modifiedCount == 0) throw new Error("medicine not found");
      response.status(200).json({ message: "update" });
    })
    .catch((error) => {
      next(error);
    });
};

exports.deleteMedicine = (request, response) => {
  medicineSchema
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
exports.getMedicineBYID = (request, response, next) => {
  medicineSchema
    .findOne({ _id: request.params.id })
    .then((data) => {
      console.log(request.params.id);
      if (data != null) {
        response.status(200).json({ data });
      } else {
        next(new Error("Medicine doesn`t Exist"));
      }
    })
    .catch((error) => next(error));
};
