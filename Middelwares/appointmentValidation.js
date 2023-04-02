const { body, query, param, validationResult } = require("express-validator");

let appointmentValidator = [
    body("doctor").isInt().withMessage("Doctor ref id should be a number"),
    body("patient").isInt().withMessage("Patient ref id should be a number"),
    body("clinic").isInt().withMessage("Clinic ref id should be a number"),
    //body("date").isDate().withMessage("Invalid date format"),
    body("date")
    .matches(
        /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
    )
    .withMessage("Invalid date format, should be DD/MM/YYYY"),
    body("time").custom(value => { //05:00  
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            throw new Error('Invalid time format ,should be in the form 00:00"');
        }
        return true;
    })
];
let appointmentID = param("id").isInt().withMessage("id should be integer");
module.exports = { appointmentValidator, appointmentID }