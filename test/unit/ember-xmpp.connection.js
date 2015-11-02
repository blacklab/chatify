//Test EmberXmpp.Connectio

var adapter =  null;

module("EmberXmpp.Connection model static members",{
    setup: function(){

        adapter = XC.Test.MockConnection.extend({
                    connect: function(callback){
                        ok(true, "connect is called on adapter");

                        callback(Strophe.Status.CONNECTED);
                    }
                  }).init();
    
        //Change getConnectionAdapter function
        EmberXmpp.Connection.reopenClass({
            getConnectionAdapter: function(options, onConnect){
                return adapter;
            }
        });
    },

    teardown: function(){
    }
});

test("1 Test EmberXmpp.Connection.createRecord()", function(){
    expect(4); //4th assert is called in adapter. See setup

    adapter.addResponse(XC.Test.Packet.extendWithXML(
      '<iq to="marvin@heart-of-gold.com" \
           type="result" \
           id="test"> \
         <query xmlns="jabber:iq:roster">\
           <item jid="zaphod@heart-of-gold.com" \
                 name="Zaphod"> \
             <group>President</group> \
           </item> \
           <item jid="ford@betelguice.net" \
                 name="Ford Prefect"> \
             <group>Hitchhiker</group> \
           </item> \
        </query>\
      </iq>'
    ));
    adapter.addResponse("");

    var connection = EmberXmpp.Connection.createRecord("karsten@karsten-n",
                                                       "host",
                                                       "secret password");
    
    //EmberXmpp.find() usually adds to store
    EmberXmpp.Connection.store["karsten@karsten-n" + "_" + "host"] = connection;

    //Connect
    connection.connect();

    //Check if own presence and roster request were sent
    equal(adapter.getLastStanzaXML(), 
          '<presence xmlns="jabber:client"></presence>',
          "Then the presence should have been sent.");
    equal(adapter.getLastStanzaXML(),
          '<iq type="get" xmlns="jabber:client"><query xmlns="jabber:iq:roster"></query></iq>',
           "The request for roster should have been sent last."
          );

    ok(EmberXmpp.Connection.store.hasOwnProperty("karsten@karsten-n" + "_" + "host"),
          "We should have a connection model.");
});

test("2 Test EmberXmpp.Connection.find()", function(){
    expect(5);

    var connection, connection2, connection3;

    adapter.addResponse("");
    adapter.addResponse(XC.Test.Packet.extendWithXML(
      '<iq to="marvin@heart-of-gold.com" \
           type="result" \
           id="test"> \
         <query xmlns="jabber:iq:roster">\
           <item jid="zaphod@heart-of-gold.com" \
                 name="Zaphod"> \
             <group>President</group> \
           </item> \
           <item jid="ford@betelguice.net" \
                 name="Ford Prefect"> \
             <group>Hitchhiker</group> \
           </item> \
        </query>\
      </iq>'
    ));
    
    connection = EmberXmpp.Connection.find("karsten@karsten-n", 
                                           "host",
                                           "secret password");

    equal(_.size(EmberXmpp.Connection.store),
          1,
          "There should be just one connection.");

    equal(connection.get('jid'),
          "karsten@karsten-n",
          "The connection should have the right jid.");

    connection2 = EmberXmpp.Connection.find("karsten@karsten-n", "host");

    deepEqual(connection2,
              connection,
              "Find should not create a different conneciton.");

    //Add a different connection
    connection3 = EmberXmpp.Connection.find("roman@karsten-n", "host");

    notDeepEqual(connection3,
                 connection,
                 "We should have two different connections.");
    equal(_.size(EmberXmpp.Connection.store),
          2,
          "We called find three times but only for" + 
          "two different jid-host combinations.");
});

module("EmberXmpp.Connection instance members.", {
    setup: function(){

        adapter = XC.Test.MockConnection.extend({
                    connect: function(callback){
                        ok(true, "connect is called on adapter");

                        callback(Strophe.Status.CONNECTED);
                    }
                  }).init();
    
        //Change getConnectionAdapter function
        EmberXmpp.Connection.reopenClass({
            getConnectionAdapter: function(options, onConnect){
                return adapter;
            }
        });
    },

    teardown: function(){}
});

test("1 Test that EmberXmpp.Connection.connect() is called on right instance", 
     function(){
         expect(2);

         var connection1, connection2;

         connection1 = EmberXmpp.Connection.find("jid1", "host", "pw");
         connection2 = EmberXmpp.Connection.find("jid2", "host", "pw");

         //reopen instances and change EmberXmpp.Connection.onConnect() to see 
         //if callback is called only once
         connection1.reopen({
             onConnect: function(status){
                ok(true, "onConnect is called for connection1.");
             }
         });

         connection2.reopen({
             onConnect: function(status){
                ok(false, "onConnect is called for connection2 but should not.");
             }
         });

        connection1.connect();
     });

test("2 Test findConversation", function(){
    expect(2);

    var conn = EmberXmpp.Connection.createRecord("karsten@karsten-n", 
                                                 "host", 
                                                 "pw");

    //Add entity to roster otherwise it won't be found
    var entities = [XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = conn.get('roster');
    roster.onRosterItems(entities);

    var conv = conn.findConversation("roman@karsten-n");

    ok(conn.get('conversations').has("roman@karsten-n"),
       "Connection should have one conversation.");

    deepEqual(conv,
              conn.get('conversations').get("roman@karsten-n"),
              "The conversation we retrieved and the one stored should be the same.");

    delete conn;
    delete entity;
    delete xcEntity;
    delete conv;
});

test("3 Test onMessage", function(){
    expect(3);

    var conn = EmberXmpp.Connection.find("karsten@karsten-n", "host", "pw");

    //Add entity to roster otherwise it won't be found
    var entities = [XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = conn.get('roster');
    roster.onRosterItems(entities);

    var conv = conn.findConversation("roman@karsten-n");

    var msg = {from: entities[0], body: "one nice body"};

    conn.onMessage(msg);

    equal(conv.get('length'),
          1,
          "One message should have been added to conversation.");

    equal(conv.get('firstObject').get('body'),
          "one nice body",
          "The messge should have pur body.");
    equal(conv.get('firstObject').get('from'),
          msg.from.jid,
          "The message should hold its sender.");
});

test("4 Test that onMessage is registered and works", function(){
    expect(1);

    var conn = EmberXmpp.Connection.find("karsten@karsten-n", "host", "pw");
    
    //Add entity to roster otherwise it won't be found
    var entities = [XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = conn.get('roster');
    roster.onRosterItems(entities);

    var conv = conn.findConversation("roman@karsten-n");
    
    //Create message
    var xml = '<message to="karsten@karsten-n" from="roman@karsten-n" type="chat">'
                + '<body>dont cry for me, Im already dead</body>'
            + '</message>'
    var msg = XC.Test.Packet.extendWithXML(xml);

    adapter.fireEvent('message', msg);

    equal(conv.get('content').length,
          1,
          "We should have the new message.");
});
