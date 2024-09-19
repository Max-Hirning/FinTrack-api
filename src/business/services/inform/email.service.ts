import fs from "fs";
import ejs from "ejs";
import path from "path";
import { environmentVariables } from "@/config";
import { transporter } from "@/business/lib/mailer";
import { InternalServerError } from "@/business/lib/errors";
import { userService } from "@/business/services/account/user.service";

const sendOtpEmail = async (email: string, otp: string) => {
    const user = await userService.findOne({ email });

    try {
        const templatePath = path.resolve(
            __dirname,
            "../../../../",
            "templates",
            "otp.html",
        );
        const template = fs.readFileSync(templatePath, "utf-8");
        const htmlContent = ejs.render(template, {
            otp: otp,
            recipientName: user.firstName,
            currentYear: new Date().getFullYear(),
        });

        await transporter.sendMail({
            to: user.email,
            html: htmlContent,
            subject: "OTP Verification",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};
const sendUpdatePasswordEmail = async (email: string) => {
    const user = await userService.findOne({ email });

    try {
        const templatePath = path.resolve(
            __dirname,
            "../../../../",
            "templates",
            "deleteAccount.html",
        );
        const template = fs.readFileSync(templatePath, "utf-8");
        const htmlContent = ejs.render(template, {
            recipientName: user.firstName,
            currentYear: new Date().getFullYear(),
        });

        await transporter.sendMail({
            to: user.email,
            html: htmlContent,
            subject: "Account Deleted",
            from: `"FinTrack" <${environmentVariables.EMAIL}>`,
        });
    } catch {
        throw new InternalServerError("Couldn't send email");
    }
};

export const emailService = {
    sendOtpEmail,
    sendUpdatePasswordEmail,
};
