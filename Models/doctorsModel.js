const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
require("dotenv").config()
const scheduleSchema = new Schema({

    // daysAvailable: {
    //     type: [{
    //         type: String,
    //         enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    //     }],
    //     required: true
    // },
    timeSlots: {
        type: [{
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            startTime: {
                type: String,
                required: true,
                validate: {
                    validator: function(value) {
                        return /^([0-9]|0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$/.test(value);
                    },
                    message: "Invalid time format, should be in the form 00:00 ",
                },
                required: true
            },
            endTime: {
                type: String,
                required: true,
                validate: {
                    validator: function(value) {
                        return /^([0-9]|0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$/.test(value);
                    },
                    message: "Invalid time format, should be in the form 00:00 ",
                },
                required: true
            }
        }],
        required: true
    }
}, { _id: false });


const doctorSchema = new mongoose.Schema({

    firstName: {
        type: String,

        required: [true, "FirstName is required"]
    },
    lastName: {
        type: String,
        required: [true, "LastName  is required"]
    },
    specialty: {
        type: String,
        enum: [
            "Pediatrician",
            "Gynecologist",
            "Cardiologist",
            "Dermatologist",
            "Psychiatrist",
            "Neurologist",
            "Radiologist",
            "Dentist",
            "Surgeon",
        ],
    },
    vezeeta: {
        type: Number,
        default: 100
    },
    password: {
        type: String,
        required: [true, "Password  is required"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    salary: {
        type: Number,
        min: [3000, 'salary must be over 3000'],
        required: [true, "  salary is required"]
    },
    age: {
        type: Number,

        min: 22,
        max: 60,
        required: [true, "  age is required"]
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    clinic: {
        type: Number,
        ref: 'clinic'
    },
    appointments: [{
        type: Number,
        required: true,
        ref: "Appointment",
        autopopulate: {
            select: 'patientModel',
            maxDepth: 1
        }
    }, ],
    schedule: scheduleSchema,
    image: {
        type: String,
        default: "./../public/img/doctor/default.jpg",
        //required: true

    },

    role: { type: String, require: true, default: 'Doctor' }



}, { _id: false })

doctorSchema.plugin(autoIncrement, { id: "doctor_id", inc_field: '_id' })
doctorSchema.index({ firstName: 1, lastName: 1 }, { unique: true })

doctorSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

doctorSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    next()
})
doctorSchema.post('save', (doc) => {
    if (doc.image) {
        const imgageUrl = `${process.env.BaseUrl}/img/doctor/${doc.image}`;
        doc.image = imgageUrl;
    }
});

doctorSchema.post('init', (doc) => {
    if (doc.image) {
        const imgageUrl = `${process.env.BaseUrl}/img/doctor/${doc.image}`;
        doc.image = imgageUrl;
    }
});

const doctors = mongoose.model("doctors", doctorSchema)

module.exports = doctors;