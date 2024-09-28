import fs from "fs";
import ejs from "ejs";
import path from "path";
import { User } from "@prisma/client";
import { environmentVariables } from "@/config";
import { transporter } from "@/business/lib/mailer";
import { InternalServerError } from "@/business/lib/errors";

const sendDeleteUserEmail = async (
    payload: Pick<User, "email" | "lastName" | "firstName">,
) => {
    const templatePath = path.resolve(
        __dirname,
        "../../../../",
        "templates",
        "deleteAccount.html",
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(template, {
        recipientName: `${payload.firstName} ${payload.lastName}`,
        currentYear: new Date().getFullYear(),
    });

    try {
        await transporter.sendMail({
            to: payload.email,
            html: htmlContent,
            subject: "Account Deleted",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
        return "Email was sent";
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};
const sendUpdateUserEmailEmail = async (
    payload: Pick<User, "email" | "lastName" | "firstName">,
) => {
    const templatePath = path.resolve(
        __dirname,
        "../../../../",
        "templates",
        "updateEmail.html",
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(template, {
        recipientName: `${payload.firstName} ${payload.lastName}`,
        currentYear: new Date().getFullYear(),
    });

    try {
        await transporter.sendMail({
            to: payload.email,
            html: htmlContent,
            subject: "Email Address Updated",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
        return "Email was sent";
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};
const sendOtpEmail = async (
    payload: Pick<User, "email" | "lastName" | "firstName">,
    otp: string,
) => {
    const templatePath = path.resolve(
        __dirname,
        "../../../../",
        "templates",
        "otp.html",
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(template, {
        otp: otp,
        recipientName: `${payload.firstName} ${payload.lastName}`,
        currentYear: new Date().getFullYear(),
    });

    try {
        await transporter.sendMail({
            to: payload.email,
            html: htmlContent,
            subject: "OTP Verification",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
        return "Email was sent";
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};
const sendUpdateUserPasswordEmail = async (
    payload: Pick<User, "email" | "lastName" | "firstName">,
) => {
    const templatePath = path.resolve(
        __dirname,
        "../../../../",
        "templates",
        "updatePassword.html",
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(template, {
        recipientName: `${payload.firstName} ${payload.lastName}`,
        currentYear: new Date().getFullYear(),
    });

    try {
        await transporter.sendMail({
            to: payload.email,
            html: htmlContent,
            subject: "Password Updated",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
        return "Email was sent";
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};

export const emailService = {
    sendOtpEmail,
    sendDeleteUserEmail,
    sendUpdateUserEmailEmail,
    sendUpdateUserPasswordEmail,
};
