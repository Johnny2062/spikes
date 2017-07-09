var chai = require('chai'),
    mocha = require('mocha'),
    expect = chai.expect,
    debug = require('debug')('socketTest');

var io = require('socket.io-client');

var socketUrl = 'http://localhost:4200';

unsupportedClientTypeOptions = {
    transports: ['websocket'],
    'force new connection': true
};

humanClientTypeOptions = {
    transports: ['websocket'],
    'force new connection': true,
    query: 'clientType=human'
};

var testClientTypeOptions ={
    transports: ['websocket'],
    'force new connection': true,
    query: 'clientType=test'
};

describe("TelepresenceBot Server: Routing Test", function () {

    beforeEach(function (done) {
        delete require.cache[require.resolve('../core/testServer')];
        server = require('../core/testServer').server;
        debug('server starts');
        done();
    });

    afterEach(function(done) {
        server.close();
        debug('server closes');
        done();
    });

    it("Should throw an error when attempting to connect an unsupported client type.", function (done) {
        var unsupportedClient = io.connect(socketUrl, unsupportedClientTypeOptions);

        unsupportedClient.on('error', function(errorMessage){
            expect(errorMessage).to.equal("Unrecognised clientType: undefined");

            unsupportedClient.disconnect();
            done();
        });
    });

    it('Should refuse connection when a bot is not available', function(done){
        var human = io.connect(socketUrl, humanClientTypeOptions);

        human.on('error', function(errorMessage){
            expect(errorMessage).to.equal("No bots available");

            human.disconnect();
            done();
        });
    });

    it("Should emit 'connect' when connecting a supported client type.", function (done) {
        var testClient = io.connect(socketUrl, testClientTypeOptions);

        testClient.once("connect", function() {
            var client = io.connect(socketUrl, humanClientTypeOptions);

            client.once("connect", function () {
                client.disconnect();
                done();
            });
        });
    });

    it("Should emit 'disconnect' when disconnecting an already connected client.", function (done) {
        var testClient = io.connect(socketUrl, testClientTypeOptions);

        testClient.once("connect", function() {
            var client = io.connect(socketUrl, humanClientTypeOptions);

            client.once("connect", function () {
                client.disconnect();
            });

            client.once("disconnect", function(){
                done();
            });
        });
    });

});