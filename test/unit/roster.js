//Test App.Roster model

module( "App.Roster model non-static members" );

test("1 Test _onRoster callback.", function(){
    expect(1);
    var roster, friends;
    
    roster = App.Roster.create();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];

    roster._onRoster(event, friends);

    var expectation = Em.A();
    expectation.push(App.User.create({jid: "Karsten@karsten-n"}));
    expectation.push(App.User.create({jid: "Romina@karsten-n"}));

    deepEqual(roster.get('friends'),
              expectation,
              "Roster should include only Karsten and Romina.");
});

test("2 Test subscription for _onRoster", function(){
    expect(1);
    var roster, friends;

    roster = App.Roster.create();
    roster._subscribe();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];
    
    $.publish('roster.client.im', [friends]);
   
    var expectation = Em.A();
    expectation.push(App.User.create({jid: "Karsten@karsten-n"}));
    expectation.push(App.User.create({jid: "Romina@karsten-n"}));
    
    deepEqual(roster.get('friends'),
              expectation,
              "Roster should include only Karsten and Romina.");
});

test("3 Test _setFriendPresence", function(){
    expect(2);
    var roster, friends;
    
    roster = App.Roster.create();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];

    roster._onRoster(event, friends);

    ok(!roster.get('friends')
              .findProperty('jid', "Karsten@karsten-n")
              .get('online'),
       "Karsten should be not be online, yet.");
    
    roster._setFriendPresence({from: "Karsten@karsten-n/1234",
                              type: "available"});

    ok(roster.get('friends')
             .findProperty('jid', "Karsten@karsten-n")
             .get('online'),
       "Karsten should be online now.");
});

test("4 Test _onPresenceChange", function(){
    expect(2);
    var roster, friends;
    
    roster = App.Roster.create();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];

    roster._onRoster(event, friends);

    ok(!roster.get('friends')
              .findProperty('jid', "Karsten@karsten-n")
              .get('online'),
       "Karsten should be not be online, yet.");
 
    roster._onPresenceChange(null,
                             {from: "Karsten@karsten-n/1234",
                              type: "available"});

    ok(roster.get('friends')
             .findProperty('jid', "Karsten@karsten-n")
             .get('online'),
       "Karsten should be online now.");
});

test("5 Test subscription for _onPresenceChange", function(){
    expect(2);
    var roster, friends;
    
    roster = App.Roster.create();
    roster._subscribe();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];

    roster._onRoster(event, friends);
    
    ok(!roster.get('friends')
              .findProperty('jid', "Karsten@karsten-n")
              .get('online'),
       "Karsten should be not be online, yet.");
    
    $.publish('presence.client.im', [{from: "Karsten@karsten-n/1234",
                                      type: "available"}]);

    ok(roster.get('friends')
             .findProperty('jid', "Karsten@karsten-n")
             .get('online'),
       "Karsten should be online now.");
});
