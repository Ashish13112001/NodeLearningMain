const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // Create a transpoter
    const transpoter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // Define the email options
    const mailOptions = {
        from: 'Ashish Barthwal <hello@ashish.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html:
    }

    // Actually send the email
    await transpoter.sendMail(mailOptions);
}


module.exports = sendEmail;