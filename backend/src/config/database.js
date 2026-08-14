const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  const uri = env.mongodbUri;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Set it in your environment variables."
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    // Do not log the original error; MongoDB errors can include the connection string.
    console.error("MongoDB connection failed:", error.name);
    throw new Error("MongoDB connection failed");
  }

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.name);
  });
}

module.exports = connectDatabase;
