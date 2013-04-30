//Test for EmberXmpp.Conversation model

module("EmberXmpp.Conversation model members",{
    setup: function(){
        conn = XC.Test.MockConnection.extend().init();
        var xc = XC.Connection.extend({connectionAdapter: conn});

        var xcEntity =  xc.Entity.extend({
          jid: "karsten@karsten-n/1234",
          presence: {
              available: true
              }
          });

        entity = EmberXmpp.Entity.create({xcEntity: xcEntity});
    },

    teardown: function(){
        delete conn;
        delete entity;
    }
});

test("1 Test if EmberXmpp.Conversation.create() adds an empty array to content.", 
     function(){
        expect(2);

        var conv = EmberXmpp.Conversation.create({withJID: "karsten@karsten-n"});

        ok(conv.get('content'), 
           "We expect content of conversation to be an array.");

        equal(conv.get('withJID'),
              "karsten@karsten-n",
              "Conversation has a withJID property.");

        delete conv;
});

test("3 onMessage callback.", function(){
    expect(6);

    var conv = EmberXmpp.Conversation.create("roman@karsten-n");

    equal(conv.get('content').length,
         0,
         "The conversation should have no messages at the start.");

    //Message without body should not be added
    conv.onMessage({
                    body: "",
                    to: XC.Entity.extend({jid:"roman@karsten-n"})
                  });
    conv.onMessage({});
    equal(conv.get('length'),
         0,
         "The message should not have been added.");

    conv.onMessage({
                    body: "Some body",
                    to: XC.Entity.extend({jid:"roman@karsten-n"})
                  });
    equal(conv.get('length'),
         1,
         "The message should have been added.");
    equal(conv.get('firstObject').get('body'),
          "Some body",
          "Conversations should hold a message with our body.");
    equal(conv.get('firstObject').get('to'),
          "roman@karsten-n",
          "The message in conversation should be address to Roman.");

    //A different conversation should have no messages.
    secondConv = EmberXmpp.Conversation.create("anotherid");
    equal(secondConv.get('length'),
          0,
          "Another conversation should not be affected by onMessage callback,");

    delete conv;
    delete secondConv;
});

test("4 sendChat", function(){
    expect(3);
    var conv = EmberXmpp.Conversation.create({to: entity});

    conv.sendChat("Another beautiful body of text");

    var xml = $($.parseXML(conn.getLastStanzaXML()));

    equal(xml.find("body").text(),
          "Another beautiful body of text",
          "The last stanza should have a text field.");

    //Check if conversation added mesage
    equal(conv.get('length'),
          1,
          "The sent message should have been added to conversation.");

    deepEqual(conv.get('firstObject').get('body'),
              "Another beautiful body of text",
              "The message should have a body.")

    delete conv;
});
