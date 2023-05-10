const {
    TwilioWhatsAppAdapter
} = require('@botbuildercommunity/adapter-twilio-whatsapp');
const path = require('path');
const restify = require('restify');
const dotenv = require('dotenv');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// This bot's main dialog.
const { EchoBot } = require('./bot');

const whatsAppAdapter = new TwilioWhatsAppAdapter({
    accountSid: process.env.accountSid, // Account SID
    authToken: process.env.authToken, // Auth Token
    phoneNumber: process.env.phoneNumber, // The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting)
    endpointUrl: process.env.endpointUrl // Endpoint URL you configured in the sandbox, used for validation
});

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(
        '\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator'
    );
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity(
        'To continue to run this bot, please fix the bot source code.'
    );
};

whatsAppAdapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new EchoBot();

// WhatsApp endpoint for Twilio
server.post('/api/whatsapp/messages', async (req, res) => {
    whatsAppAdapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
});
