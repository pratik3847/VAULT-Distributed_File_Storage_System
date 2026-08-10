require("dotenv").config();

const s3Client = require("../config/s3");
const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

async function testS3() {
  try {
    const response = await s3Client.send(
  new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET,
  })
);

    console.log("S3 connection successful!");
    console.log("Objects:", response.Contents || []);
  } catch (error) {
    console.error("S3 connection failed:", error.message);
  }
}

testS3();