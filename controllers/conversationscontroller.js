const mongoose = require('mongoose');
const Conversation = require('../models/conversation');
var ObjectId = mongoose.Schema.Types.ObjectId;

let ConversationController = function () { };

/**
 * @param  {Object|Number|String} id «Object|Number|String» value of _id to query by
 * @returns {Conversation} Returns object that will resolve to a conversation, or undefined
 */
ConversationController.prototype.getConversationById = async function (id) {
  return Conversation.findById(id).exec();
};

/**
 * @param  {Object|Number|String} id «Object|Number|String» value of _id to query by
 * @returns {Conversation} Returns object that will resolve to a conversation, or undefined
 */
ConversationController.prototype.getConversationByUsers = async function (user1, user2) {
  let id = this.returnId(user1, user2);
  return Conversation.findOneAndUpdate({ _id:id }, { verified:true}, { upsert: true, new: true }).exec();
};

/**
 * @param  {User} user1 User to get/generate conversation ID with.
 * @param  {User} user2 User to get/generate conversation ID with.
 * @returns {String} The conversation ID based on the IDs of the two users.
 */
ConversationController.prototype.returnId = function (user1, user2) {
  if (user1.id < user2.id) { 
    return user1.id + user2.id
  } else {
    return user2.id + user1.id
  }
};

let conversationController = new ConversationController();
module.exports = conversationController;
