const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendMail = async (email, subject, content) => {
    try {
      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html: content
      };
  
      transporter.sendMail(mailOptions, (error, result) => {
        if(error) {
            console.log(error);
        } else {
            console.log('Email sent successfully', result.messageId);
        }
      });
    } catch (error) {
        res.status(500).json({
            message: "Server error: ",
            message: error.message
        })
    }
  };

  module.exports = {
    sendMail
  };