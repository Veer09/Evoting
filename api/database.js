const mongoose = require("mongoose");

const connectionURI = process.env.connectionURI;
console.log(connectionURI);

// Connect to MongoDB Atlas
mongoose
  .connect(connectionURI)
  .then(() => console.log("MongoDB Connected Successfully 🚀"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

module.exports = mongoose;
