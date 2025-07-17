const nodemailer = require("nodemailer");
const to_email = "myleads.ganaka@gmail.com";
const pass = "mpixhrjkisedjkwh"

const sendEmail = async (
    email_id,
    otp
) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: to_email,
            pass: pass
        },
    });

    let senddescriptiondata = `
    E-mail: ${email_id},
    OTP:${otp}`;
    const mailOptions = {
        from: to_email,
        to: email_id,
        subject: 'Work Monitoring User OTP Verification',
        text: senddescriptiondata,
        replyTo: `${email_id}`
    };

    try {
        const data = await transporter.sendMail(mailOptions);
        console.log("data", data)
        return "Email sent successfully";
    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong");
    }
};


module.exports = {
    sendEmail
};
