const { ActivityHandler, MessageFactory } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const replyText = `Echo: ${context.activity.text}`;
            await context.sendActivity(
                MessageFactory.text(replyText, replyText)
            );
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
