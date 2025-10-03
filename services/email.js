import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
import fp from "fastify-plugin";
configDotenv();

export const gMailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  pool: true,
  auth: {
    user: process.env.GOOGLE_SMTP_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Create a test account or replace with real credentials.
export const etherealMailer = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

export default fp(function (fastify, { mailer = "gmail" }, done) {
  fastify.decorate("emailer", mailer === "gmail" ? gMailer : etherealMailer);
  done();
});
