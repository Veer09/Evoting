const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// In-memory OTP storage (replace with Redis or database in production)
const otpStorage = new Map();

// OTP expiration time in milliseconds (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

// Generate a random 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP with expiration
function storeOTP(userId, otp) {
  otpStorage.set(userId, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY
  });
}

// Verify OTP
function verifyOTP(userId, otp) {
  const otpData = otpStorage.get(userId);
  
  if (!otpData) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }
  
  if (Date.now() > otpData.expiresAt) {
    otpStorage.delete(userId);
    return { valid: false, message: "OTP expired. Please request a new one." };
  }
  
  if (otpData.otp !== otp) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }
  
  // OTP is valid, delete it to prevent reuse
  otpStorage.delete(userId);
  return { valid: true };
}

// Send OTP via email
async function sendOTPByEmail(email, otp) {
  try {
    console.log('there');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your EVote Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>EVote Login Verification</h2>
          <p>Your one-time password (OTP) for logging into EVote is:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTPByEmail
};