const request = require('request');
const crypto = require("crypto");

ref = '66de3faf4563ceb1dec07cb2eede76ca';
sec_token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTc4ZGE2YmE2MzNhNTJmNGNmYjhkMzIiLCJjcmVhdGVkQXQiOiIyMDIwLTAzLTIzVDE1OjQ4OjU5Ljg4MVoiLCJpYXQiOjE1ODQ5Nzg1Mzl9.sIGJFUjA_JP3GYuSU8QS06a-F37yU8HhQC5SCGWQokw';
module.exports.reference;
module.exports.token;

module.exports.DialogflowFulfillmentLogger = class DialogflowFulfillmentLogger {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    /**
     * 
     * @param {*} message : Dialogflow response Object
     * 
     */

    send(message) {
        this.json(message)
    }
    /**
     * 
     * @param {*} message : Dialogflow response Object
     */
    json(message) {
        this.res.send(message)
        this.logUserMessage().then(data => {
            console.log("User message logged")
            if (message.fulfillmentMessages) {
                let messages = message.fulfillmentMessages;
                messages.map(msg => {
                    let responseMessage = {};
                    responseMessage.fulfillmentText = msg.text.text[0];
                    this.logBotMessage(responseMessage).then(data => {
                        console.log("Bot message logged")
                    })
                })
            }
            else {
                this.logBotMessage(message).then(data => {
                    console.log("Bot message logged")
                })
            }
        })
    }
    logBotMessage(messageObj) {
        var messageData = {};
        messageData.origin = "Bot";
        messageData.user = { id: 'Default-bot', name: 'Bot' }
        messageData.conversationID = this.req.body.session;
        messageData.type = 'message';
        messageData.text = messageObj.fulfillmentText;
        messageData.timestamp = new Date();
        messageData.channel = this.req.body.originalDetectIntentRequest.source || "Try it Out!"
        console.log("From Bot");
        return reportMessage(messageData)
    }
    
    logUserMessage() {
        var messageData = {};
        messageData.origin = "User";
        messageData.id = this.req.body.responseId;
        messageData.conversationID = this.req.body.session
        messageData.user = { id: 'Default-user', name: "User" }
        messageData.type = 'message';
        messageData.text = this.req.body.queryResult.queryText;
        messageData.timestamp = new Date();
        messageData.channel = this.req.body.originalDetectIntentRequest.source || "Try it Out!"
        messageData.intent = this.req.body.queryResult.intent.displayName;
        console.log("From User");
        return reportMessage(messageData)
    }
}


function reportMessage(messageData) {
    //https://minsights-dialogflow-api.azurewebsites.net/conversation/messages/:owner_id
    var requestPayload = {
        url: "https://vbot-insights-dev-api.azurewebsites.net/conversation/v4/register",
        method: 'POST',
        json: true,
        headers: {
            'refid': ref
        },
        auth: {
            'bearer': sec_token
        },
        body: messageData
    };
    return new Promise(function (fulfill, reject) {
        request.post(requestPayload, function (err, response, body) {
            if (!err) {
                console.log("logged")
                fulfill(body)
            } else {
                reject(err);
            }
        });
    })
}


module.exports.DialogflowModuleLogger = class DialogflowModuleLogger {
    
    /**
     * @param {String} message User or Bot message 
     * @param {String} intentName intent.displayName - Should be passed when you are logging User message
     * @param {String} channel Name of the channel your bot is integrated. Defaults to 'Try it Out!'
     * @param {String} sessionId User Session - Session ID should be same for entire conversation of the user
     * @param {String} userType bot or user
     */
    
    logMessage(message, intentName,channel, sessionId, userType) {
        if ((userType).toLocaleLowerCase() === "bot") {
            console.log("bot")
            var messageData = {};
            messageData.origin = "Bot";
            messageData.user = { id: 'Default-bot', name: 'Bot' }
            messageData.conversationID = sessionId;
            messageData.type = 'message';
            messageData.text = message;
            messageData.timestamp = new Date();
            messageData.channel = channel || "Try it Out!"
            console.log(messageData)
            return reportMessage(messageData)
        }
        else if ((userType).toLocaleLowerCase() === "user") {
            var messageData = {};
            messageData.origin = "User";
            messageData.id = crypto.randomBytes(8).toString("hex");
            messageData.conversationID = sessionId
            messageData.user = { id: 'Default-user', name: "User" }
            messageData.type = 'message';
            messageData.text = message;
            messageData.timestamp = new Date();
            messageData.channel = channel || "Try it Out!"
            messageData.intent = intentName;
            console.log("From User");
            console.log(messageData)
            return reportMessage(messageData)
        }
        else {
            throw new Error('userType must be Bot or User');
        }
    }
}
