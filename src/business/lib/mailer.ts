import nodemailer from "nodemailer";
import { environmentVariables } from "@/config";

const transporter = nodemailer.createTransport({
    auth: {
        user: environmentVariables.EMAIL,
        pass: environmentVariables.EMAIL_PASS,
    },
    port: 465,
    secure: true,
    ignoreTLS: true,
    host: "smtp.gmail.com",
});

export { transporter };
