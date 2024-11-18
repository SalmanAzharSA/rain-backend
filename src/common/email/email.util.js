const sgMail = require("@sendgrid/mail");
const configs = require("../../../configs");

sgMail.setApiKey(configs.sendgrid.apiKey);
const client = require("@sendgrid/client");
exports.sendAccountConfirmationEmail = async function (
  confirmEmailPayload,
  result = {}
) {
  try {
    const { receiverEmail, emailVerificationLink } = confirmEmailPayload;

    const msg = {
      to: receiverEmail,
      from: {
        email: configs.sendgrid.sender,
        name: configs.sendgrid.senderName,
      },
      templateId: configs.sendgrid.confirmEmailTemplateId,
      dynamicTemplateData: {
        emailVerificationLink,
      },
    };

    const res = await sgMail.send(msg);
  } catch (ex) {
    console.log("ex.response.body", ex);
    result.ex = ex;
  } finally {
    return result;
  }
};
