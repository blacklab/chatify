

//Test EmberXmpp.Entity model

module("EmberXmpp.Entity model non-static members", {
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
    }
});

test("1 Test name property.", function(){
    expect(1);
    equal(entity.get('name'), 
         "karsten", 
         "Friend's name should be first part of jid.");
});

test("2 Test jid property.", function(){
    expect(1);
    equal(entity.get('jid'), 
         "karsten@karsten-n", 
         "Friend's jid should be bare jid.");
});

test("3 Test set and get presence property.", function(){
    expect(4);

    deepEqual(entity.get('presence'),
              {available: true},
              "Presence should contain available field.");

    //Add observers
    entity.addObserver('presence', function(){
        //This assert is only called when observer fires. 
        //If not expect(3) will complain.
        ok(true, "presence observer should be fired.");
    });
    entity.addObserver('online', function(){
        ok(true, "online observer should be fired.");
    });

    //Change presence
    entity.set('presence', {available: false, status: "AFK"});

    deepEqual(entity.get('presence'),
              {available: false, status: "AFK"},
              "Presence should contain status and false availability.");
});

test("4 Test online property.", function(){
    expect(1);
    ok(entity.get('online'), 
         "Friend's should be online.");
});

test("5 Test sendChat.", function(){
    expect(2);

    entity.sendChat("A beautiful body of text", "subject");

    xml = $($.parseXML(conn.getLastStanzaXML()));

    equal(xml.find("body").text(),
          "A beautiful body of text",
          "The last stanza should have a text field.");

    equal(xml.find("subject").text(),
          "subject",
          "The message should have a subject,");
});

test("6 Test id property.", function(){
    expect(1);
    equal(entity.get('id'), 
         "karsten@karsten-n", 
         "Friend's id should be his jid.");
});
