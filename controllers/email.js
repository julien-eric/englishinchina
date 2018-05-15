let nodemailer = require('nodemailer');

module.exports = {

    sendEmail: function(to, from, subject, text, callbackMessage, req) {
        let smtpTransport = nodemailer.createTransport({
            service: 'sendGrid',
            host: 'smtp.sendgrid.net',
            secureConnection: false,
            port: 587,
            auth: {
                user: 'jueri',
                pass: 'Montreal123!'
            }
        });

        let mailOptions = {
            to: to,
            from: from,
            subject: subject,
            text: text,
            html: text
        };

        smtpTransport.sendMail(mailOptions, function(err) {
            req.flash('info', callbackMessage);
            if (!err) {
                return Promise.resolve();
            } else {
                // return Promise.reject(err);
            }
        });
    },

    createReviewHelpfulMessage: function(res, name, numberHF, schoolId, callback) {
        res.render('email', {
            name: name,
            numberHF: numberHF,
            schoolId: schoolId
        },
            function(err, html) {
                if (err) {
                    console.log(err);
                } else {
                    callback(html);
                }
            });
    },

    resetPassword: function(req, user, token, req) {
        let text = 'You are receiving this because you (or someone else) have requested ' +
            'the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        let callbackMessage = 'An e-mail has been sent to ' + user.email + ' with further instructions.';

        module.exports.sendEmail(user.email, 'passwordreset@englishinchina.co',
            'Second Language World Password Reset',
            text,
            callbackMessage,
            req
        );
    }

};
