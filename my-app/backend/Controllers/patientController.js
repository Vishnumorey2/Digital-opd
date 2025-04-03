const { createPatient, getAllPatients } = require("../models/patientModel");

const addPatient = async (req, res) => {
  const { age, gender, history, symptoms, additional_info } = req.body;  
  console.log("Received data:", req.body);
  try {
    const patient = await createPatient(age, gender, history, symptoms, additional_info);
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: "Error adding patient" });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Error fetching patients" });
  }
};

module.exports = { addPatient, getPatients };
