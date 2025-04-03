const pool = require("../routes/db");

const createPatient = async (age, gender, history, symptoms, additional_info) => {
  console.log("called createPatient function");
  const query = `
    INSERT INTO patients (age, gender, history, symptoms, additional_info)
    VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [age, gender, history, symptoms, additional_info];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getAllPatients = async () => {
  const { rows } = await pool.query("SELECT * FROM patients");
  return rows;
};

module.exports = { createPatient, getAllPatients };
