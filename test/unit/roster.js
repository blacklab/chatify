//Test App.Roster model

module( "App.Roster model non-static members" );

test("1 Test _onRoster callback.", function(){
    var roster, friends;
    
    roster = App.Roster.create();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];

    roster._onRoster(event, friends);

    var expectation = Em.A();
    expectation.push(App.User.create({jid: "Karsten@karsten-n/1234"}));
    expectation.push(App.User.create({jid: "Romina@karsten-n/1234"}));

    deepEqual(roster.get('friends'),
              expectation,
              "Roster should include only Karsten and Romina.");
});

test("2 Test subscription for _onRoster", function(){
    var roster, friends;

    roster = App.Roster.create();
    roster._subscribe();
    friends = [{jid: "Karsten@karsten-n/1234"}, 
               {jid: "Romina@karsten-n/1234"}];
    
    $.publish('roster.client.im', [friends]);
   
    var expectation = Em.A();
    expectation.push(App.User.create({jid: "Karsten@karsten-n/1234"}));
    expectation.push(App.User.create({jid: "Romina@karsten-n/1234"}));
    
    deepEqual(roster.get('friends'),
              expectation,
              "Roster should include only Karsten and Romina.");
});

test("3 Test setPresence", function(){
    ok(false, "Not refactored yet.");
});

test("4 Test _onPresenceChange", function(){
    ok(false, "Not refactored yet.");
});
