
//Test App.User model

module( "App.User model non-static members" );

test("1 Test name property.", function(){
    var friend = App.User.create({jid: "karsten@karsten-n/1234"});

    equal(friend.get('name'), 
         "karsten", 
         "Friend's name should be first part of jid.");
});

test("2 Test id property.", function(){
    var friend = App.User.create({jid: "karsten@karsten-n/1234"});

    equal(friend.get('id'), 
         "karsten@karsten-n", 
         "Friend's id should be jid without resource.");
});

test("3 Test setPresence.", function(){
    expect(5);
    var friend = App.User.create({jid: "karsten@karsten-n/1234"});

    //Add a new presence. We don't have a resource, yet.
    friend.setPresence({from: "karsten@karsten-n/1234", 
                        type: "available"});

    equal(friend.get('resources').length,
          1,
          "We set only one presence.");

    //Add a second presence from a differen resource
    friend.setPresence({from: "karsten@karsten-n/5678", 
                        type: "available"});

    equal(friend.get('resources').length,
          2,
          "We set only a presence from a different resource.");

    //Set "offline" presence for first resource
    friend.setPresence({from: "karsten@karsten-n/1234", 
                        type: "unavailable"});

    equal(friend.get('resources').length,
          1,
          "We removed first resource by setting unavailable presence.");

    //Set a differen presence for second resource
    friend.setPresence({from: "karsten@karsten-n/5678", 
                        type: "available",
                        status: "other"});

    equal(friend.get('resources').length,
          1,
          "We just changed the presence of one resource.");
    equal(friend.get('resources').get('firstObject').get('status'),
          "other",
          "We changed the presence to \"other\".");
});

test("4 Test presence property.", function(){
    expect(2);
    var friend = App.User.create({jid: "karsten@karsten-n/1234"});

    friend.setPresence({from: "karsten@karsten-n/1234",
                        type: "available"});

    equal(friend.get('presence'),
         "available",
         "Friend should be online.");

    friend.setPresence({from: "karsten@karsten-n/1234",
                        type: "unavailable"});

    equal(friend.get('presence'),
          "unavailable",
          "Friend is unavailable again.");
});

test("5 Test online property.", function(){
    expect(2);
    var friend = App.User.create({jid: "karsten@karsten-n/1234"});

    friend.setPresence({from: "karsten@karsten-n/1234",
                        type: "available"});

    ok(friend.get('online'),
         "Friend should be online.");

    friend.setPresence({from: "karsten@karsten-n/1234",
                        type: "unavailable"});

    ok(!friend.get('online'),
          "Friend is offline again.");
});
