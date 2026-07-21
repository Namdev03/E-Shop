import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  console.log(process.env.TWILIO_ACCOUNT_SID),
  console.log(process.env.TWILIO_AUTH_TOKEN),
  
  process.env.TWILIO_AUTH_TOKEN
);

export const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
