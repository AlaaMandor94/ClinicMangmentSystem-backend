const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const schema = new mongoose.Schema(
  {
    _id: { type: Number },
    email: { type: String },
  },
  { _id: false }
);

schema.plugin(AutoIncrement, { id: "email_id_counter", inc_field: "_id" });

//mapping: binding Schema with collection
module.exports = mongoose.model("email", schema);
