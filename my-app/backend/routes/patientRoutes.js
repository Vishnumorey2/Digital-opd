const express = require("express");
const { addPatient, getPatients } = require("../Controllers/patientController");
const router = express.Router();

router.post("/patients", addPatient);
router.get("/patients", getPatients);

module.exports = router;
