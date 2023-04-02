const Appointment = require('../models/appointmentModel');
const doctorSchema = require("./../Models/doctorsModel");
const mongoose = require("mongoose");
require("./../Models/patientModel");
const PatientSchema = mongoose.model("patientModel");
require("./../Models/ClinicModel");
const clinicSchema = mongoose.model("clinic");

//get all appointments
exports.getAllAppointments = async(req, res) => {
    try {
        // 1)Filtring
        const queryObj = {...req.query };
        const excludedFieleds = ['page', 'sort', 'limit', 'fields', 'select'];

        excludedFieleds.forEach(el => delete queryObj[el]);


        //  filtering gte|gt|lt
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`)


        let query = Appointment.find(JSON.parse(queryStr))
            .populate({ path: "doctor" })
            .populate({ path: "patient" })
            // .populate({ path: "clinic", select: ["name", "address"] })

        // sorting .......................
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy)
            console.log(sortBy)
        }
        // Excute Query
        const apointments = await query

        // res.status(200).json({
        //     staus: 'succesed',
        //     result: apointments.length,
        //     data: [
        //         apointments
        //     ]
        // })

        res.status(200).json(

            apointments

        )
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


// Create an appointment
exports.createAppointment = async(req, res, next) => {

    try {

        //// Check if the doctor is available at the specified time
        //console.log(req.body)
        const { doctor, patient, clinic, date, time } = req.body;
        //console.log(time);
        const existingAppointment = await Appointment.findOne({ doctor, date, time });
        if (existingAppointment) {
            return res.status(400).json({ error: 'Doctor is not available at the specified time' });
        }
        //check existingAppointment for patient
        const checkAppointment = await Appointment.findOne({ doctor, patient, date });
        //console.log("checkAppointment is =", checkAppointment);
        if (checkAppointment) {
            return res.status(400).json({ message: `You've already booked an appointment today` })
        }
        //session time for the patient
        const minutes = time.split(":")[1];
        if (minutes !== "00" && minutes !== "30") {
            return res.status(400).json({ message: "Doctor session  is 30m ,expected HH:00 or HH:30" });
        }
        //check if dctor in this clinc or not 
        // const doctorExsisting = await doctorSchema.findOne({ _id: doctor, clinic: clinic })
        // console.log("doctor es", doctorExsisting) //cooooooooooooo
        // if (!doctorExsisting) {
        //     return res.status(400).json({ error: 'Doctor is not available at This clinic' });
        // }

        //check if patient in this clinc or not 
        const patirntExsisting = await PatientSchema.findOne({ _id: patient })
        if (!patirntExsisting) {
            return res.status(400).json({ error: 'we cant assign an appointment for non exsisting patient' });
        }

        //check doctor schedule

        function getDay(sentDate) {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const date = sentDate.split("/");
            const dateReFormate = `${date[2]}-${date[1]}-${date[0]}` //yy-mm-dd
            const d = new Date(dateReFormate);
            let returnedday = days[d.getDay()];
            return returnedday;
        }
        let day = getDay(date); //this fun to get the day 
        console.log("the   day is ===", day);
        const doctorSchdul = await doctorSchema.findOne({ _id: doctor })
        console.log(doctorSchdul)

        //console.log("test schedula doc availabel days", doctorSchdul.schedule[0].daysAvailable.includes(day)); //check daysAvailable for doc
        let allTimeSlots = doctorSchdul.schedule.timeSlots
        console.log(allTimeSlots);
        let schedualFlag = false;
        allTimeSlots.forEach(TimeSlot => {
            console.log(TimeSlot.day == day && TimeSlot.startTime <= time && TimeSlot.endTime >= time)
            if (TimeSlot.day == day && TimeSlot.startTime <= time && TimeSlot.endTime >= time) {
                schedualFlag = true;

            }
        });

        if (!schedualFlag) {
            return res.status(400).json({ massage: "Time out of doctor secdula" });
        }

        // check if dat and time in the future 
        let newDate = date.split("/");
        newDate = `${newDate[1]}/${newDate[0]}/${newDate[2]}`;

        const appointmentDate = new Date(`${newDate} ${time}:00`);
        if (appointmentDate < new Date()) {
            return res
                .status(400)
                .json({ message: "Appointment date must be in the future." });
        }
        req.body
        const newAppointment = await Appointment.create(req.body)
            //111
            //FLAGE:true
        await doctorSchema.findOneAndUpdate({ _id: doctor }, { $push: { appointments: newAppointment._id } });
        res.status(201).json({
            status: 'succesed',
            data: {
                newAppointment: newAppointment
            }
        })
    } catch (error) {
        next(error)
            //return res.status(400).json({ error: error.message });
    }

};

// Edit an appointment
exports.editAppointment = async(req, res) => {
    try {
        //// Check if the doctor is available at the specified time
        const { doctor, date, time } = req.body;
        console.log(req.body)
        const existingAppointment = await Appointment.findOne(req.body);
        console.log(existingAppointment)
        if (existingAppointment) {
            return res.status(400).json({ error: 'Doctor is not available at the specified time' });
        }
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true }); //still here validation for ether doctor her or not
        return res.status(200).json({ appointment });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Remove an appointment
exports.removeAppointment = async(req, res, next) => {

    try {
        const { id } = req.params;
        // Remove the appointment from the doctor's list of appointments
        const appointment = await Appointment.findByIdAndDelete(id)
        if (appointment != null) {
            res.status(200).json({
                massage: "appointment deleted",
                deletedObj: appointment

            })
        } else {
            next(new Error("appointment doesn't exist"));
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

// get prescription by doctor id
exports.getAppointmentByPatientId = (request, response, next) => {
    Appointment
        .find({ patient: request.params.id })
        .populate({ path: "doctor", select: ["firstName", "lastName"] })
        .populate({ path: "patient", select: ["Fname", "Lname"] })
        .then((result) => {
            if (result != null) {
                response.status(200).json(result);
            } else {
                next(new Error("A Appointment not exist for this paient"));
            }
        })
        .catch((error) => {
            next(error);
        });
};