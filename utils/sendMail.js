const nodemailer = require("nodemailer");
const testAccount = {
    email:process.env.NODE_MAIL,
    password:process.env.NODE_MAIL_PASSWORD
}

async function sendmail(email, userid, token, type) {
    try {
      let transporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      let url = `${process.env.NODE_FRONTEND_URL}/${type}`;
      let k = Math.floor(Math.random() * 100);
      let mailInfo = await transporter.sendMail({
        from: `no-reply <nodemailer123${k}@gmail.com>`,
        to: email,
        subject: type,
        html: `<h1>hello user</h1><p>to reset your password <a href=${url}/${token}/${userid}>${url}/${token}/${userid}</a></p><br>
              <p>Front end is running on ${process.env.NODE_FRONTEND_URL}</p>`,
      });
      if (mailInfo.rejected.length) {
        return {
          status: 400,
          msg: "there was some error in sending the mail"
        };
      } else {
        console.log("mail sent succesfully")
        return {
          status: 200,
          msg: "verification link is sent to email"
        };
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  
  module.exports = sendmail;