

//Test EmberXmpp.Entity model

module("EmberXmpp.Entity model non-static members", {
    setup: function(){
       var xcEntity =  XC.Entity.extend({
          jid: "karsten@karsten-n/1234",
          presence: {
              available: true
              }
          });

       entity = EmberXmpp.Entity.create({xcEntity: xcEntity});
    },

    teardown: function(){}
});

test("1 Test name property.", function(){
    expect(1);
    equal(entity.get('name'), 
         "karsten", 
         "Friend's name should be first part of jid.");
});

test("2 Test online property.", function(){
    expect(1);
    ok(entity.get('online'), 
         "Friend's should be online.");
});

test("3 Test sendChat.", function(){
    ok(false,"No test added");
});
