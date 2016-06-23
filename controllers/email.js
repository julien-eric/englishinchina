var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");

module.exports = {

    sendEmail : function(to, from, subject, text, callbackMessage ,req, done){

            var smtpTransport = nodemailer.createTransport({
                service: "sendGrid",
                host : "smtp.sendgrid.net",
                secureConnection : false,
                port: 587,
                auth : {
                    user : "jueri",
                    pass : "Montreal123!"
                }
            });

            var mailOptions = {
                to: to,
                from: from,
                subject: subject,
                text: text
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', callbackMessage);
                done(err, 'done');
            });

    },

    resetPassword : function(req, user, token, req, done){
        var text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        var callbackMessage = 'An e-mail has been sent to ' + user.email + ' with further instructions.'

        this.exports.sendEmail(user.email,'passwordreset@englishinchina.co','English in China Password Reset', text, callbackMessage, req, done);
    }

}