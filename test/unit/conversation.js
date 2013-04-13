//Test App.Conversation Model
module( "App.Conversation model static members" );

test("1 Test if App.Conversation.store does not include anything at start.", 
     function(){
        ok(!App.Conversation.store.hasOwnProperty("someid"), 
           "We expect App.Conversation.store to have no item");
});

test("2 Test if App.Converstion.find adds to store.", function(){
    App.Conversation.find("someid");  
    ok(App.Conversation.store.hasOwnProperty("someid"), 
       "We expect App.Conversation.store to have one item with key 'someid'");
});

test("3 Test _onMessage callback", function(){
    var conv, message;

    conv = App.Conversation.find("karsten@karsten-n");

    message = {from: "karsten@karsten-n",
               to: "roman@karsten-n",
               body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP"
              };

    App.Conversation._onMessage(null, message);

    deepEqual(conv.get("messages"),
          [
            {from: "karsten@karsten-n",
             to: "roman@karsten-n",
             body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP",
             tracks: ["spotify:track:4EBisBBehGON4ESJsNZBsP"]
            }
           ],
          "The conversation should have only one message.");
});

test("4 Test subscribe and tinypubsub", function(){
    var conv, message;

    conv = App.Conversation.find("karsten@karsten-n");
    
    message = {from: "karsten@karsten-n",
               to: "roman@karsten-n",
               body: "via pubsub"
              };
    
    App.Conversation.subscribe();
    
    $.publish('message.client.im', message);
    
    deepEqual(conv.get("messages"),
          [
            {from: "karsten@karsten-n",
             to: "roman@karsten-n",
             body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP",
             tracks: ["spotify:track:4EBisBBehGON4ESJsNZBsP"]
            },
            {from: "karsten@karsten-n",
             to: "roman@karsten-n",
             body: "via pubsub",
             tracks: []
            }
           ],
          "The conversation should have two messages. " + 
          "One from test 3 and the other one from this test.");
});
