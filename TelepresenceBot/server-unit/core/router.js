var debug = require('debug')('router');

function Router(rooms, botLocator) {
    this.rooms = rooms;
    this.botLocator = botLocator;
}

Router.prototype.route = function(client, next) {
    var roomName = client.handshake.query.room;
    var rawClientType = client.handshake.query.clientType;
    var clientType = ClientType.from(rawClientType);

    switch(clientType) {
        case ClientType.TEST:
            var StaticBotLocator = require("../test/support/staticBotLocator.js");
            this.botLocator = new StaticBotLocator(this.rooms);
            return next();
        case ClientType.BOT:
            return next();
        case ClientType.HUMAN:
            var availableBot = this.botLocator.locateFirstAvailableBotIn(roomName);

            if(availableBot) {
                client.handshake.query.room = availableBot;
                return next();
            } else {
                return next(new Error('No bots available'));
            }

        default:
            return next(new Error('Unrecognised clientType: ' + rawClientType));
    }
}

module.exports = Router;

