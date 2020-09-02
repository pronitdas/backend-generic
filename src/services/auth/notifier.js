const {
  startCase
} = require('lodash');

let HTMLing = require('htmling');

const generalTemplate = require('../../utilities/mail-generator.js')
module.exports = async function (app) {
  const hostname = app.get('hostName');
  const mailDefaults = app.get('mail');
  function getLink(type, hash) {
    const url = hostname + type + '?token=' + hash;
    return url;
  }

  function getRlinkWithVToken(type, hash1, hash2) {
    const url = hostname + type + '?token=' + hash1 + '&email=' + hash2;
    return url;
  }

  async function sendEmail(templateCode, tokenLink, user, action, signUp) {
    let email;
    try {
      const emailTemplateService = app.service('email-template')
      const template = await emailTemplateService.find({ query: { template_code: templateCode } })
      
      const {
        firstName,
        lastName
      } = user;

      let body = template.data[0].mail_body;

      console.log(body);

      email = {
        from: mailDefaults.mail_id,
        to: user.email,
        subject: template.data[0].mail_subject,
        html: generalTemplate({
          tokenLink,
          hostname,
          signUp: signUp,
          firstName,
          content: body,
          lender: true,
          token_link: !!tokenLink,
          action : action 
        })
      };
      
      return app
      .service('mailer')
      .create(email)
      .then(function (result) {
        console.log('Sent email', result);
      })
      .catch(err => {
        console.log('Error sending email', err);
      });
      
    } catch (error) {
      console.log(error)
    }


    
  }


  return {
    notifier: function (type, user, notifierOptions) {
      let tokenLink, content;
      console.log(type,'erer');
      switch (type) {
        case 'resendVerifySignup': //sending the user the verification email
          tokenLink = getRlinkWithVToken(
            'verify',
            user.verifyToken,
            user.email
          );
          
          return sendEmail(type, tokenLink, user, 'to verify', true);

        case 'verifySignup': // confirming verification
          tokenLink = getRlinkWithVToken(
            'verify',
            user.verifyToken,
            user.resetToken
          );


          email = {
            from: mailDefaults.mail_id,
            to: user.email,
            subject: 'Confirm Signup',
            lender: true,
          };
          // return sendEmail(email);
          break;

        case 'sendResetPwd':
          tokenLink = getLink('reset', user.resetToken);
          console.log(tokenLink);
          // content = `A password reset has been requested for your account.<br> If you did not make this request, you can safely ignore this email. A password reset request can be made by anyone,
          // and it does not indicate that your account is in any danger of being accessed by someone else.<br><br>If you do actually want to reset your password, visit this link: <br><br>${tokenLink}`;
          // email = {
          //   from: mailDefaults.mail_id,
          //   to: user.email,
          //   subject: 'Reset Password',
          //   html: generalTemplate({
          //     tokenLink,
          //     hostname,
          //     firstName,
          //     lender: true,
          //     content: content.mail_body
          //   })
          // };

          return sendEmail(type, tokenLink, user, 'to reset your password', false);


        case 'resetPwd':
          // tokenLink = getLink('reset', user.resetToken)
          email = {
            from: mailDefaults.mail_id,
            to: user.email,
            lender: true,
            subject: 'Password Reset Successfull ',
            html: `Hi ${startCase(
              user.firstName
            )} your passsword has been reset succesfully`
          };
          // return sendEmail(email)
          return {};
          break;

        case 'passwordChange':
          //TODO : Trigger logout when this is called
        
          // email = {
          //   from: mailDefaults.mail_id,
          //   to: user.email,
          //   subject: 'Password Change Successfull',
          //   html: generalTemplate({
          //     tokenLink,
          //     hostname,
          //     firstName,
          //     lender: true,
          //     content: content.mail_body
          //   })
          // };
          return sendEmail(type, null, user, null, false);
          break;

        case 'identityChange':
          tokenLink = getLink('verifyChanges', user.verifyToken);
          // email = {
          //   from: mailDefaults.mail_id,
          //   to: user.email,
          //   subject: 'Email verification requested',
          //   html: `Hi ${startCase(
          //     user.firstName
          //   )} your email has been changed succesfully`
          // };
          return sendEmail(type, tokenLink, user, 'to verify the changes', false);
          break;

        default:
          break;
      }
    }
  };
};
