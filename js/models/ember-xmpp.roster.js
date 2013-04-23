
//Handles roster callbacks etc

EmberXmpp.Roster = Ember.ArrayProxy.extend({

    content: null, //Array of entities (friends)

    init: function(){
        this.set('content', Em.A());
    },

    /**
     * @param {Array of XC.Entity} entites List of friends received.
     */
    onRosterItems: function(entities){
        entities.forEach(this.onRosterItem, this);
    },

    /**
     * @param {XC.Entity} entity A friend which should be added to roster.
     */
    onRosterItem: function(entity){
        //Create EmberXmpp.Enttiy from XC.Entity and append
        var e = EmberXmpp.Entity.create({'xcEntity': entity});

        this.get('content').pushObject(e);
    },

    onPresence: function(entity){
        var contact = this.findProperty('jid',entity.jid);
        contact.set('presence', entity.presence);
    }
});
