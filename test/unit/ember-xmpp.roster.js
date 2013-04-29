//Test EmberXmpp.Roster model

module("EmberXmpp.Roster model non-static members", {
    setup: function(){},

    teardown: function(){}
});

test("1 Test onRosterItem callback.", function(){
    expect(2);

    var xcEntity =  XC.Entity.extend({
        jid: "karsten@karsten-n/1234",
        presence: {
            available: true
        }
    });

    var roster = EmberXmpp.Roster.create();
    roster.onRosterItem(xcEntity);

    equal(roster.get('content').length,
          1,
          "The roster should have one item.");

    equal(roster.get('firstObject').get('xcEntity'),
          xcEntity,
          "First element should be our entity.");
});

test("2 Test onRosterItems callback.", function(){
    expect(3);

    //Creat two entities this time
    var entities = [XC.Entity.extend({
                        jid: "karsten@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    }),
                    XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = EmberXmpp.Roster.create();
    var roster2 = EmberXmpp.Roster.create();
    roster.onRosterItems(entities);

    equal(roster.get('content').length,
          2,
          "The roster should have two entitiies.");

    equal(roster2.get('content').length,
          0,
          "Our second roster should have no entities.");

    //convert entitis to EmberXmpp.Entity
    var entityNames = entities.map(function(item){ 
                                     var e = EmberXmpp.Entity
                                                      .create({xcEntity: item});
                                     return e.get('name');
                                   });

    deepEqual(roster.map(function(item){ return item.get('name') }),
          entityNames,
          "The roster should have roman and karsten.");
});

test("3 Test onPresence callback.", function(){
    expect(2);

    //Add some entities
    var entities = [XC.Entity.extend({
                        jid: "karsten@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    }),
                    XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = EmberXmpp.Roster.create();
    roster.onRosterItems(entities);

    ok(roster.get('firstObject').get('online'),
       "Karsten should be online.");

    roster.onPresence({jid: "karsten@karsten-n", 
                       presence: { available: false} });

    //onPresence with entity not in roster should not crash
    roster.onPresence({jid: "notinroster"});

    ok(!roster.get('firstObject').get('online'),
       "Karsten should be offline now.");
});

test("3 Test getContact", function(){
    expect(1);

    //Add some entities
    var entities = [XC.Entity.extend({
                        jid: "karsten@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    }),
                    XC.Entity.extend({
                        jid: "roman@karsten-n/1234",
                        presence: {
                            available: true
                        }
                    })];

    var roster = EmberXmpp.Roster.create();
    roster.onRosterItems(entities);

    var contact = roster.getContact("karsten@karsten-n");

    deepEqual(contact,
              roster.get('firstObject'),
              "The contact we retrieved should be the first contact in roster.");
});
