require('dotenv').config(); // Load environment variables

module.exports = {
  DB_CONFIG: {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  },
};

API_KEY=AIzaSyDrWujaC0kVk7RMuBc5FjRh8WX_RlC5tWA


