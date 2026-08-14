require("dotenv").config();

const env = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};

module.exports = env;
