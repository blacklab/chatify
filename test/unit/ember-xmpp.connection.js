//Test EmberXmpp.Connection

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

    teardown: function(){}
});

test("1 Test EmberXmpp.Connection.createRecord()", function(){
    expect(4); //4th assert is called in adapter. See setup

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

    var connection = EmberXmpp.Connection.createRecord("host", 
                                                       "karsten@karsten-n",
                                                       "secret password");
    
    //EmberXmpp.find() usually adds to store
    EmberXmpp.Connection.store["karsten@karsten-n" + "_" + "host"] = connection;

    //Connect
    connection.connect();

    //Check if own presence and roster request were sent
    equal(adapter.getLastStanzaXML(),
          '<iq type="get" xmlns="jabber:client"><query xmlns="jabber:iq:roster"></query></iq>',
           "The request for roster should have been sent last."
          );
    equal(adapter.getLastStanzaXML(), 
          '<presence xmlns="jabber:client"></presence>',
          "Then the presence should have been sent.");

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

module("EmberXmpp.Connection instance members.");

test("1 Test that EmberXmpp.Connection.connect() is called on right instance", 
     function(){
         var connection1, connection2;

         connection1 = EmberXmpp.Connection.find("jid1", "host", "pw");
         connection2 = EmberXmpp.Connection.find("jid2", "host", "pw");

         //reopen instances and change EmberXmpp.Connection.onConnect() to see 
         //if callback is called only once
         connection1.reopen({
             onConnect: function(status){
                ok();
             }
         });

         ok(false, "no test added.");
     });
