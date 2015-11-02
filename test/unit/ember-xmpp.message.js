//Tests for EmberXmpp.Message model

module("EmberXmpp.Message model instance members.", {
    setup: function(){
        adapter = XC.Test.MockConnection.extend().init();
        xc = XC.Connection.extend({connectionAdapter: adapter});

        entity = xc.Entity.extend({
            jid: 'karsten@karsten-n/1234',
            name: 'Karsten'
        });
    },

    teardown: function(){
        delete adapter;
        delete xc;
        delete entity;
    }
});

test("1 Test to property", function(){
    expect(1);

    var xcMsg, msg;

    //Create XC.MessageStanza
    xcMsg = xc.MessageStanza.extend({
	            type: 'chat',
                body: 'Some body',
                subject: null,
                thread: 1,
                to: entity,
                id: null
              });

    //Create EmberXmpp.Message
    msg = EmberXmpp.Message.create({xcMessageStanza: xcMsg});

    equal(msg.get('to'),
          "karsten@karsten-n/1234",
          "We expect the full jid.");
});

test("2 Test body property", function(){
    expect(1);

    var xcMsg, msg;

    //Create XC.MessageStanza
    xcMsg = xc.MessageStanza.extend({
	            type: 'chat',
                body: 'Some body',
                subject: null,
                thread: 1,
                to: entity,
                id: null
              });

    //Create EmberXmpp.Message
    msg = EmberXmpp.Message.create({xcMessageStanza: xcMsg});

    equal(msg.get('body'),
          "Some body",
          "We expect a certain body.");
});

test("3 Test from property", function(){
    expect(1);

    var xcMsg, msg;

    //Create XC.MessageStanza
    xcMsg = xc.MessageStanza.extend({
	            type: 'chat',
                body: 'Some body',
                subject: null,
                thread: 1,
                from: entity,
                id: null
              });

    //Create EmberXmpp.Message
    msg = EmberXmpp.Message.create({xcMessageStanza: xcMsg});

    equal(msg.get('from'),
          "karsten@karsten-n/1234",
          "We expect the full jid.");
});

test("4 Test error on create", function(){
    expect(2);

    throws(function(){ EmberXmpp.Message.create({}) },
           "We expect an error.");

    throws(function(){ EmberXmpp.Message.create({xcMessageStanza: null}) },
           "We expect an error.");
});

