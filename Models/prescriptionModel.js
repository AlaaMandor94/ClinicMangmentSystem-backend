const mongoose = require("mongoose");
const autoIncrement = require("mongoose-sequence")(mongoose);

const schema = new mongoose.Schema(
  {
    _id: { type: Number },
    doctorId: { type: Number, ref: "doctors" },
    patientId: { type: Number, ref: "patientModel" },
    clinicId: { type: Number, ref: "clinic" },
    medicineId: [{ type: Number, ref: "medicine" }],
    prescriptionDate: {
      type: String, //"2016-11-05" date formate
        get: (date) => {
            return date.split("T")[0];
        },
        required: [true, " Date for appointment is required"]
    },
  },
  { _id: false }
);
schema.plugin(autoIncrement, { id: "prescriptionId", inc_field: "_id" });
mongoose.model("prescription", schema);
