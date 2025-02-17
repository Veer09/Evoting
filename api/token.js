const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;


const generateToken = (payload, options = {}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h", ...options });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
