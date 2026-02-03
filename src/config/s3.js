const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

module.exports = new AWS.S3();
