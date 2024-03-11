const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(options.message);
  const transporter = nodeMailer.createTransport({
    port : 465,
    host: process.env.SMPT_HOST,
    secure: true,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
  }
  });
  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject:options.subject,
    text:options.message,
  };

  transporter.sendMail(mailOptions,(error,info)=>{
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
};

module.exports = sendEmail;
