const { request, response } = require("express");
const { Result } = require("express-validator");
const mongoose = require("mongoose");
require("./../Models/invoiceDataModel");
const invoiceDataSchema = mongoose.model("invoiceData");

// export all data about invoiceData
exports.getAllInvoiceData = async(request, response, next) => {
    let sortBy,
        feilds,
        removeFields = ["select", "sort"],
        reqQuery = {...request.query }; //spread operator to get the data of the object
    // remove the filters from the query
    removeFields.forEach((param) => {
        delete reqQuery[param];
    });
    // including mongo operators
    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    // select
    if (request.query.select) {
        feilds = request.query.select.split(",").join(" ");
    }
    // sort
    if (request.query.sort) {
        feilds = request.query.sort.split(",").join(" ");
    } else {
        sortBy = request.body.id;
    }
    await invoiceDataSchema
        .find(JSON.parse(queryString))
        .select(feilds)
        .sort(sortBy)
        .then((result) => {
            response.status(200).json(result);
        })
        .catch((error) => {
            next(error);
        });
};

exports.addinvoiceData = async(request, response, next) => {
    let data = new invoiceDataSchema({
            _id: request.body.id,
            clinicAddress: request.body.clinicAddress,
            clientAddress: request.body.clientAddress,
            invoiceNumber: request.body.invoiceNumber,
            invoiceDate: request.body.invoiceDate,
            invoiceDueDate: request.body.invoiceDueDate,
            products: request.body.products,
        }).data
        .save()
        .then(() => {
            response.status(201).json({ success: true, message: "invoiceData has been added" });
        })
        .catch((error) => {
            next(error);
        });
};
// delete invoiceData by id
exports.deleteInvoiceDataByID = (request, response, next) => {
    invoiceDataSchema
        .deleteOne({ _id: request.params.id })
        .then((result) => {
            response.status(201).json({ result, message: "invoiceData has been deleted" });
        })
        .catch((error) => next(error));
};

exports.updateInvoiceData = (request, response, next) => {
    invoiceDataSchema
        .updateOne({
            _id: request.params.id,
        }, {
            $set: {
                products: request.body.products,
            },
        })
        .then((result) => {
            if (result.matchedCount != 0) {
                response.status(200).json({ message: "updated" });
            } else {
                next(new Error("invoiceData doesn't Exist"));
            }
        })
        .catch((error) => next(error));
};
// get invoiceData by id
exports.getInvoiceDataByID = (request, response, next) => {
    invoiceDataSchema
        .findOne({ _id: request.params.id })
        .then((result) => {
            if (result != null) {
                response.status(200).json({ message: "Found", result });
            } else {
                next(new Error("invoiceData doesn't exist"));
            }
        })
        .catch((error) => {
            next(error);
        });
};