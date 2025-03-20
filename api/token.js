const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;


const generateToken = (payload, options = {}) => {
  const token = jwt.sign(payload, secretKey, { expiresIn: "6h", ...options });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    console.log(error);
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
