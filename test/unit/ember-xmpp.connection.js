//Test EmberXmpp.Connection

module("EmberXmpp.Connection model static members",{
    setup: function(){
    },

    teardown: function(){}
});

test("1 Test EmberXmpp.Connection.createConnection()", function(){
    expect(5);

    var adapter = XC.Test.MockConnection.extend({
                    connect: function(callback){
                        ok(true, "connect is called on adapter");

                        callback(Strophe.Status.CONNECTED);
                    }
                  }).init();

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

    //Change getConnectionAdapter function
    EmberXmpp.Connection.reopenClass({
        getConnectionAdapter: function(options, onConnect){
            return adapter;
        }
    });

    var connection = EmberXmpp.Connection.createConnection("host", 
                                                           "karsten@karsten-n",
                                                           "secret password");

    //Check if own presence and roster request were sent
    ok(false, "No test for send presence.");
    equal(adapter.getLastStanzaXML(),
          '<iq type="get" xmlns="jabber:client"><query xmlns="jabber:iq:roster"></query></iq>',
           "The request for roster should have been sent."
          );

    ok(EmberXmpp.Connection.store.hasOwnProperty("karsten@karsten-n" + "_" + "host"),
          "We should have a connection model.");
});
