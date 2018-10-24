const Conversation = require('../models/conversation');
var ObjectId = mongoose.Schema.Types.ObjectId;

let ConversationController = function () { };

/**
 * @param  {Object|Number|String} id «Object|Number|String» value of _id to query by
 * @returns {Conversation} Returns object that will resolve to a conversation, or undefined
 */
ConversationController.prototype.getConversationById = async (id) => {
  return Conversation.findById(id).exec();
};

/** Takes two users to create a conversation, the id of a conversation is always the combination of the two user ids (whichever is lesser than goes in front)
 * @param {User} user1 One of the two users of the conversation
 * @param {User} user2 One of the two users of the conversation
 * @returns {Conversation} Returns newly created conversation
 */
ConversationController.prototype.createConversation = async (user1, user2) => {
  let id;
  if (user1.id < user.id) {
    id = user1.id + user2.id
  } else {
    id = user2.id + user1.id
  }
  return Conversation.create({ _id: new ObjectId(id) });
};

let conversationController = new ConversationController();
module.exports = conversationController;
