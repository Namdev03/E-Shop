import { twilioClient, TWILIO_VERIFY_SERVICE_SID } from "../config/twilio.js";

export const sendOtpSms = async (mobile) => {
  return twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: mobile, channel: "sms" });
};

export const checkOtpSms = async (mobile, code) => {
  const result = await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: mobile, code });

  return result.status === "approved";
};
