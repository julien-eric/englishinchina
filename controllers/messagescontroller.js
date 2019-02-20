const Message = require('../models/message');
const conversationsController = require('./conversationscontroller');
const emailsController = require('./emailscontroller');
const awsManager = require('../awsmanager');

let MessageController = function () { };

/**
 * @param  {Object|Number|String} id «Object|Number|String» value of _id to query by
 * @return {Message} Returns object that will resolve to a Message, or undefined
 */
MessageController.prototype.getMessageById = async (id) => {
    return Message.findById(id).exec();
};

/**
 * @param  {User} user1 The user sending the message
 * @param  {User} user2 The user receiving the message
 * @param  {String} content The content of the message
 * @return {Message} Returns newly created message
 */
MessageController.prototype.createMessage = async (user1, user2, content) => {
    let conversation = await conversationsController.getConversationByUsers(user1, user2);
    try {

        let message = await Message.create({ conversation, user: user1, content });

        let emailBody = emailsController.generateEmailBody(
            'Message from ' + user1.teachingDetails.fullName,
            content,
            'View Teacher Profile',
            'https://www.secondLanguage.world'
        );

        emailsController.sendEmail(
            user2.email,
            'jobapplicant@secondlanguage.world',
            'Job Application from ' + message.user.teachingDetails.fullName,
            emailBody,
            'text/html'
        );

        return Promise.resolve(message);
    } catch (error) {
        return error;
    }
};

/**
 * @param  {User} applicant The user sending the message
 * @param  {String} content The content of the message
 * @return {String} Returns formatted email string
 */
MessageController.prototype.formatApplicationMessage = (applicant, content) => {
    let emailContent = '';
    emailContent += 'Applicant name: ' + applicant.teachingDetails.fullName + '<br>';
    emailContent += 'Applicant email: ' + applicant.email + '<br><br>';
    let resumeLink = `https://${awsManager.bucketName}.s3.amazonaws.com/${applicant.teachingDetails.urlResume}`;
    emailContent += 'Applicant resume: <a href="' + resumeLink + '">' + applicant.teachingDetails.fileNameResume + '</a><br><br>';
    emailContent += 'Message: ' + content;
    return emailContent;
};

/**
 * @param  {User} user1 User to get conversation ID with.
 * @param  {User} user2 User to get conversation ID with.
 * @return {[Message]} Returns all messages from the conversation of these two users
 */
MessageController.prototype.getConversationMessages = async (user1, user2) => {
    let conversation = await conversationsController.getConversationByUsers(user1, user2);
    return Message.find({ conversation }).exec();
};


let messageController = new MessageController();
module.exports = messageController;
