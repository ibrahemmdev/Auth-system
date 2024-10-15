const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.emailPass,
        pass: process.env.emailPass
    }
});

const sendEmail = async (options) => {
    const mailOpts = {
      from: `App <${process.env.email}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
  
    await transporter.sendMail(mailOpts);
}

module.exports = sendEmail;