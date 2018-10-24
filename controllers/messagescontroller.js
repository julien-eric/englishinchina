const Message = require('../models/message');

let MessageController = function () {};

/**
 * @param  {Object|Number|String} id «Object|Number|String» value of _id to query by
 * @returns {Message} Returns object that will resolve to a Message, or undefined
 */
MessageController.prototype.getMessageById = async (id) => {
    return Message.findById(id).exec();
};

/**
 * @returns {Message} Returns newly created message
 */
MessageController.prototype.createMessage = async (conversation, user, content) => {
  return Message.create({conversation, user, content});
};

let messageController = new MessageController();
module.exports = messageController;
