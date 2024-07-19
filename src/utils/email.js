import nodemailer from "nodemailer";
import { emailtemplet } from "./emailTemplet.js";
import jwt from "jsonwebtoken";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDEMAIL,
    pass: process.env.SENDEMAILPASSWORD,
  },
});

export const sendEmail = async (email, otpCode ) => {
  async function main() {
    const token = jwt.sign({ email }, process.env.EMAIL_KEY, async (err, token) => {
      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"project 👻" <${process.env.SENDEMAIL}>`, // sender address
        to: email, // list of receivers
        subject: "Confirm Email", // Subject line
        text: `Your OTP code is ${otpCode}`, // plain text body
        html: emailtemplet(token, otpCode), // html body
      });

      console.log("Message sent: %s", info.messageId);
    });
  }

  await main();
};

export async function sendResetPasswordMail( email, otpCode) {
  const info = await transporter.sendMail({
      from: `"project 👻" <${process.env.SENDEMAIL}>`,
      to: email,
      subject: "Reset Password ✔",
      text: "Hello ?",
      html: `<p>Hi, your verification code is: ${otpCode}</p>`,
  });
  console.log("Message sent:", info.messageId);
}
