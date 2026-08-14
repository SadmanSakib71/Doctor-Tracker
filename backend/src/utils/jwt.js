const jwt = require("jsonwebtoken");
const env = require("../config/env");

function getJwtSecret() {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not defined. Set it in your environment variables.");
  }

  return env.jwtSecret;
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signToken,
  verifyToken,
};
