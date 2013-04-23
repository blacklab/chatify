//Test for EmberXmpp.Conversation model

module("EmberXmpp.Conversation model non-static members", {
    setup: function(){},

    teardown: function(){}
});

test("1 onMessage callback.", function(){
    ok(false, "Test not added.");
});

module("EmberXmpp.Conversation model static members");

test("1 Test if App.Conversation.store does not include anything at start.", 
     function(){
        expect(1);

        ok(!EmberXmpp.Conversation.store.hasOwnProperty("someid"), 
           "We expect App.Conversation.store to have no item");
});

test("2 Test if App.Converstion.find adds to store.", function(){
    expect(2);

    var conv = EmberXmpp.Conversation.find("someid");  

    ok(EmberXmpp.Conversation.store.hasOwnProperty("someid"), 
       "We expect App.Conversation.store to have one item with key 'someid'");
});
