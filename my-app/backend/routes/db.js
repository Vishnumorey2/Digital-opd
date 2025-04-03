const {Pool} = require('pg');// Import the Pool class

const config = require('../../config');// Import database configuration
// Create a new Pool instance using the database configuration
const pool = new Pool(config.DB_CONFIG);
// Export the pool so it can be used in other parts of the application
module.exports = pool;