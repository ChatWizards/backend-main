const nodemailer = require("nodemailer");
const testAccount = {
    email:process.env.NODE_MAIL,
    password:process.env.NODE_MAIL_PASSWORD
}

async function sendmail(email, userid, token, type,userName,message) {
    try {
      let content;
      let transporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: testAccount.email,
          pass: testAccount.password,
        },
      });
      let url = `${process.env.NODE_FRONTEND_URL}/${type}`;
      switch(type){
        case 'verify':
          content = `<h4>hello user</h4><p>To verify ypur account<a href=${url}/${token}>click here</a></p><br>
                     <p>Front end is running on ${process.env.NODE_FRONTEND_URL}</p>` 
          break
        case 'resetPassword':
          content = `<h4>hello user</h4><p>To rest your account password :<a href=${url}/${token}>click here</a></p><br>
                     <p>Front end is running on ${process.env.NODE_FRONTEND_URL}</p>` 
          break
        case 'invite':
          content = `<p>${user} invites you to chat wizard. To know more visit <a href=${process.env.NODE_FRONTEND_URL}>process.env.NODE_FRONTEND_URL</a></p><br>`
          break
        case 'groupInvite':
          content = `<><>`
          break
      }
      let k = Math.floor(Math.random() * 100);
      let mailInfo = await transporter.sendMail({
        from: `no-reply <nodemailer123${k}@gmail.com>`,
        to: email,
        subject: type,
        html:content
      });
      if (mailInfo.rejected.length) return false
        return true
    } catch (err) {
      console.log(err.message);
    }
  }
  
  module.exports = sendmail;