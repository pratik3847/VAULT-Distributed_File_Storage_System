require("dotenv").config();

const { uploadToS3 } = require("../services/storage.service");

async function testUpload() {
  try {
    const key = "test/hello.txt";

    const body = Buffer.from("Hello from Distributed File Storage!");

    const uploadedKey = await uploadToS3({
      key,
      body,
      contentType: "text/plain",
    });

    console.log("S3 upload successful!");
    console.log("Object key:", uploadedKey);
  } catch (error) {
    console.error("S3 upload failed:", error.message);
  }
}

testUpload();