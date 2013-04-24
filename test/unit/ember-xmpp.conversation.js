//Test for EmberXmpp.Conversation model

module("EmberXmpp.Conversation model static members");

test("1 Test if App.Conversation.store does not include anything at start.", 
     function(){
        expect(1);

        ok(!EmberXmpp.Conversation.store.hasOwnProperty("someid"), 
           "We expect App.Conversation.store to have no item");
});

test("2 Test if App.Converstion.find adds to store.", function(){
    expect(1);

    var conv = EmberXmpp.Conversation.find("someid");  

    ok(EmberXmpp.Conversation.store.hasOwnProperty("someid"), 
       "We expect App.Conversation.store to have one item with key 'someid'");
});

module("EmberXmpp.Conversation model non-static members", {
    setup: function(){},

    teardown: function(){}
});

test("1 onMessage callback.", function(){
    expect(5);

    var conv = EmberXmpp.Conversation.find("roman@karsten-n");

    equal(conv.get('content').length,
         0,
         "The conversation should have no messages at the start.");

    //Message without body should not be added
    conv.onMessage({body: ""});
    equal(conv.get('content').length,
         0,
         "The message should not have been added.");

    conv.onMessage({body: "Some body"});
    equal(conv.get('content').length,
         1,
         "The message should have been added.");
    deepEqual(conv.get('firstObject'),
             {body: "Some body"},
             "The conversation should hold our messages.");

    secondConv = EmberXmpp.Conversation.find("anotherid");
    equal(secondConv.get('content').length,
          0,
          "Another conversation should not be affected by onMessage callback,");
});
