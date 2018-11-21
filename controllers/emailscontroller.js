const helper = require('sendgrid').mail;
const settings = require('simplesettings');
const sg = require('sendgrid')(settings.get('SENDGRID_API_KEY'));

module.exports = {

    sendEmail: function (to, from, subject, text) {

        let toEmail = new helper.Email(to);
        let fromEmail = new helper.Email(from);
        let content = new helper.Content('text/plain', text);
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

    renderTemplateHtml: function () {

    },

    emailVerification: function (req, user) {
        let text = 'You\'re on your way! ' +
            'Let\'s confirm your email adress.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            req.headers.origin + '/emailverification/' + user.email + '?token=' + user.token + '\n\n';

        module.exports.sendEmail(
            user.email,
            'emailverification@secondlanguage.world',
            'Second Language World Email Verification',
            text
        );
    },

    resetPassword: function (req, user) {
        let text = 'You are receiving this because you (or someone else) have requested ' +
            'the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            req.headers.origin + '/reset/' + user.resetPasswordToken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        module.exports.sendEmail(
            user.email,
            'passwordreset@secondlanguage.world',
            'Second Language World Password Reset',
            text
        );
    },

    createReviewHelpfulMessage: function (res, name, numberHF, schoolId, callback) {
        res.render('email', {
            name: name,
            numberHF: numberHF,
            schoolId: schoolId
        },
            function (err, html) {
                if (err) {
                    console.log(err);
                } else {
                    callback(html);
                }
            });
    }

};
