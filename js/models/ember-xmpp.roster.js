
//Handles roster callbacks etc

EmberXmpp.Roster = Ember.ArrayProxy.extend({

    content: null, //Array of entities (friends)

    init: function(){
        this.set('content', Em.A());
    },

    onRosterItems: function(entities){
        _.each(entities, this.onRosterItem);
    },

    onRosterItem: functioni(entity){
        //Create EmberXmpp.Enttiy from XC.Entity and append
        var e = EmberXmpp.Entity.create({'xcEntity': entity});

        this.get('content').pushObject(e);
    },

    onPresence: function(entity){
        var contact = this.find('jid', entity.jid);
        contact.presence = entity.presence;
    }
)};
