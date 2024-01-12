const AWS = require("aws-sdk");

export const eventBridge = new AWS.EventBridge({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
  region: process.env.AWS_REGION,
});
