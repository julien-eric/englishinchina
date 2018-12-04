const helper = require('sendgrid').mail;
const settings = require('simplesettings');
const pug = require('pug');
const sg = require('sendgrid')(settings.get('SENDGRID_API_KEY'));
const path = require('path');

module.exports = {


    /**
     * @param {String} to Email adress to send to
     * @param {String} from Email adress to use as sender
     * @param {String} subject Email Subject
     * @param {Object} email The content of the email itself
     * @param {String} email.title This is the header in the body of the email (not the subject)
     * @param {String} email.content This is the center paragraph of the email (not the subject)
     * @param {String} email.linkName Call to action button name
     * @param {String} email.linkUrl Call to action button link
     * @param {String} contentType The content type, text/plain or text/html
     */
    sendEmail: function (to, from, subject, email, contentType) {
        let type = (contentType ? contentType : 'text/html');
        let toEmail = new helper.Email(to);
        let fromEmail = new helper.Email(from);
        let content = new helper.Content(type, this.renderTemplateHtml(email));
        let mail = new helper.Mail(fromEmail, subject, toEmail, content);

        let request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });

        sg.API(request, function (error, response) {
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
        });
    },


    /**
     * @param {Object} emailBody The content of the email itself
     * @param {String} emailBody.title This is the header in the body of the email (not the subject)
     * @param {String} emailBody.content This is the center paragraph of the email (not the subject)
     * @param {String} emailBody.linkName Call to action button name
     * @param {String} emailBody.linkUrl Call to action button link
     * @return {String} Compiled template email HTML, ready for sending
     */
    renderTemplateHtml: function (emailBody) {
        const file = path.join('views', 'email', 'template.pug');
        const compile = pug.compileFile(file);
        const html = compile({ email: emailBody });
        return html;
    },


    /**
     * @param {String} emailAdress The new user whose email is being verified
     * @param {String} link Email Confirmation link including the randomly generated token
     */
    emailVerification: function (emailAdress, link) {

        let message = 'You\'re on your way! ' +
            'Let\'s confirm your email adress.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n';

        let emailBody = { title: 'Almost there!', content: message, linkName: 'Confirm Email', linkUrl: link };

        module.exports.sendEmail(
            emailAdress,
            'emailverification@secondlanguage.world',
            'Second Language World Email Verification',
            emailBody,
            'text/html'
        );
    },


    /**
     * @param {String} contactBackEmail The email adress that the user who filled the form has left
     * @param {String} contactMessage The message that the user who filled the form has left
     */
    contactUsForm: function (contactBackEmail, contactMessage) {

        const emailMessage = `Email: ${contactBackEmail}\n\n${contactMessage}`;
        let emailBody = { title: 'Someone has left a message!', content: emailMessage, linkName: 'Reply to Message', linkUrl: 'https://www.secondlanguage.world' };

        module.exports.sendEmail(
            'julieneric11@gmail.com',
            'userfeedback@secondlanguage.world',
            'Feedback comment from a visitor',
            emailBody,
            'text/html'
        );
    },

    /**
     * @param {String} emailAdress The email adress of the user resetting their password
     * @param {String} link The link to resetting the password, including the token info
     */
    resetPassword: function (emailAdress, link) {

        const emailMessage = 'You are receiving this because you (or someone else) have requested ' +
            'the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        let emailBody = { title: 'Password Reset Request', content: emailMessage, linkName: 'Reset Password', linkUrl: link };

        module.exports.sendEmail(
            emailAdress,
            'passwordreset@secondlanguage.world',
            'Second Language World Password Reset',
            emailBody,
            'text/html'
        );
    }

};
