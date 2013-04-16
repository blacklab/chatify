//Test App.Conversation Model
module( "App.Conversation model static members" );

test("1 Test if App.Conversation.store does not include anything at start.", 
     function(){
        expect(1);

        ok(!App.Conversation.store.hasOwnProperty("someid"), 
           "We expect App.Conversation.store to have no item");
});

test("2 Test if App.Converstion.find adds to store.", function(){
    expect(2);

    var conv = App.Conversation.find("someid");  

    ok(App.Conversation.store.hasOwnProperty("someid"), 
       "We expect App.Conversation.store to have one item with key 'someid'");

    equal(conv.get('friendJid'),
          "someid",
          "The friendJid should beset.");
});

test("3 Test _onMessage callback for receiving messages", function(){
    var conv, message;

    //The conversation is with roman
    conv = App.Conversation.find("roman@karsten-n");

    //The message is comming from roman
    message = {from: "roman@karsten-n",
               to: "karsten@karsten-n",
               body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP"
              };

    App.Conversation._onMessage(null, message);

    deepEqual(conv.get("messages"),
          [
            {from: "roman@karsten-n",
             to: "karsten@karsten-n",
             body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP",
             tracks: ["spotify:track:4EBisBBehGON4ESJsNZBsP"]
            }
           ],
          "The conversation should have only one message.");
});

test("4 Test subscribe and tinypubsub", function(){
    expect(1);

    var conv, message;

    //The conversation is with roman
    conv = App.Conversation.find("roman@karsten-n");
    
    //The message is comming from roman
    message = {from: "roman@karsten-n",
               to: "karsten@karsten-n",
               body: "via pubsub"
              };
    
    App.Conversation.subscribe();
    
    $.publish('message.client.im', message);
    
    deepEqual(conv.get("messages"),
          [
            {from: "roman@karsten-n",
             to: "karsten@karsten-n",
             body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP",
             tracks: ["spotify:track:4EBisBBehGON4ESJsNZBsP"]
            },
            {from: "roman@karsten-n",
             to: "karsten@karsten-n",
             body: "via pubsub",
             tracks: []
            }
           ],
          "The conversation should have two messages. " + 
          "One from test 3 and the other one from this test.");
});

test("5 Test sending a message", function(){
    expect(2);

    var conv, message;

    //The conversation is with roman
    conv = App.Conversation.find("roman@karsten-n");
    
    //This time we send a message to roman
    message = {from: "karsten@karsten-n",
               to: "roman@karsten-n",
               body: "Hi there, my friend!"
              };

    App.Conversation.subscribe();

    //send the message once we are connected
    $.subscribe('connected.client.im', function(){
        conv.sendChat(message);
        xmppClient.disconnect();

        deepEqual(conv.get("messages"),
          [
            {from: "roman@karsten-n",
             to: "karsten@karsten-n",
             body: "hello world with track: spotify:track:4EBisBBehGON4ESJsNZBsP",
             tracks: ["spotify:track:4EBisBBehGON4ESJsNZBsP"]
            },
            {from: "roman@karsten-n",
             to: "karsten@karsten-n",
             body: "via pubsub",
             tracks: []
            },
            {from: "karsten@karsten-n",
             to: "roman@karsten-n",
             body: "Hi there, my friend!",
             tracks: []
            }
           ],
          "The conversation should have the sent messages.");
    });  

    // Creat XMPP client and connect
    xmppClient = new IM.Client({
        jid: App.user.jid,
        password: App.user.password,
        host: CONFIG.host,
        debug: true
    });
    xmppClient.connect(); 


    ok(false, "Test not added yet.");
});
