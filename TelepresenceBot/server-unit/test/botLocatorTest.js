var expect = require('chai').expect
    BotLocator = require('../core/botLocator.js');

var roomWithASingleBot = {
    'botId': {
        sockets: {'botId':true},
        length:1
    },
    'London': {
        sockets: {'botId':true},
        length:1
    }
};

var roomWhereBotIsConnectedToHuman = {
    'botId': {
        sockets: {'botId':true, 'humanId':true},
        length:2
    },
    'London': {
        sockets: {'botId':true},
        length:1
    }
};

var roomContainingMultipleBotsWhereOneIsConnectedToHuman = {
    'botId01': {
        sockets: {'botId01':true, 'human01':true},
        length:2
    },
    'botId02': {
        sockets: {'botId02':true},
        length:1
    },
    'London': {
        sockets: {'botId01':true, 'botId02':true},
        length:2
    }
};

describe('BotLocator Tests.', function() {

    it('Should give undefined when bot is not found in given room.', function(done){
        var botLocator = new BotLocator(roomWithASingleBot);

        var bot = botLocator.locateFirstAvailableBotIn('Unexpected Room');

        expect(bot).to.be.undefined;
        done();
    });

    it('Should give bot id when bot room does not contain other sockets.', function(done){
        var botLocator = new BotLocator(roomWithASingleBot);

        var bot = botLocator.locateFirstAvailableBotIn('London');

        expect(bot).to.equal('botId');
        done();
    });

    it('Should give undefined when bot room contains other sockets.', function(done){
        var botLocator = new BotLocator(roomWhereBotIsConnectedToHuman);

        var bot = botLocator.locateFirstAvailableBotIn('London');

        expect(bot).to.be.undefined;
        done();
    });

    it('Should give first bot in room that contains multiple bots.', function(done){
        var botLocator = new BotLocator(roomContainingMultipleBotsWhereOneIsConnectedToHuman);

        var bot = botLocator.locateFirstAvailableBotIn('London');

        expect(bot).to.equal('botId02');
        done();
    });

});