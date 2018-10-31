let assert = require('assert');
let chai = require('chai');
const settings = require('simplesettings');
let expect = chai.expect;
const mongoose = require('mongoose');
mongoose.connect(settings.get('DB_URL'));

let conversationsController = require('../controllers/conversationscontroller');
let messagesController = require('../controllers/messagescontroller');
let usersController = require('../controllers/usersController');


describe.only('Messaging', function () {

  describe('Creation', function () {

    afterEach(function () {
      //   sampleJob = {};
    });

    it('should correctly create a conversation whose ID is the combination of both userIDs', async function () {

      try {

        let sampleUser1 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];
        let sampleUser2 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];

        let newConversation = await conversationsController.getConversationByUsers(sampleUser1, sampleUser2);
        expect(newConversation.id).to.be.equal(conversationsController.returnId(sampleUser1, sampleUser2));
      } catch (error) {
        console.log(error);
        expect(false);
      }
    });

    it('should correctly send a message for a conversation', async function () {

      try {

        let sampleUser1 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];
        let sampleUser2 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];
        let newConversation = await conversationsController.getConversationByUsers(sampleUser1, sampleUser2);
        let message = await messagesController.createMessage(sampleUser1, sampleUser2, "I'm interested in applying for this job offer");

        expect(message.conversation.id).to.be.equal(conversationsController.returnId(sampleUser1, sampleUser2));
        expect(message.user.id).to.be.equal(sampleUser1.id);
      } catch (error) {
        console.log(error);
        expect(false);
      }
    });

    it('should be able to retrieve the messages from a conversation', async function () {

      try {

        let sampleUser1 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];
        let sampleUser2 = (await usersController.getAllUsers())[Math.floor(Math.random() * 15) + 1];
        let newConversation = await conversationsController.getConversationByUsers(sampleUser1, sampleUser2);
        
        let message = await messagesController.createMessage(sampleUser1, sampleUser2, "I'm interested in applying for this job offer");
        let message2 = await messagesController.createMessage(sampleUser1, sampleUser2, "Please look at my resume");
        let message3 = await messagesController.createMessage(sampleUser2, sampleUser1, "We will, thank you!");

        let messageConvo = await messagesController.getConversationMessages(sampleUser1, sampleUser2);
        let messageConvo2 = await messagesController.getConversationMessages(sampleUser2, sampleUser1);

        expect(messageConvo[0].content).to.be.equal(message.content);
        expect(messageConvo[1].content).to.be.equal(messageConvo2[1].content);
      } catch (error) {
        console.log(error);
        expect(false);
      }
    });

  });

});
