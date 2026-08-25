require('dotenv').config();
const configFile = require('../config.json');

module.exports = {
  port: process.env.PORT || configFile.port,
  jwtSecret: process.env.JWT_SECRET || "Keylix_SuperSecret_ChangeMe",
  backendUrl: process.env.BACKEND_URL || configFile.backendUrl,
  raw: configFile
};
