//Handles entity callbacks and actions on entities such as sendChat..

EmberXmpp.Entity = Ember.Object.extend({
    
    xcEntity: null,

    init: function(){
        this._super();
    },

    jid: function(){
        return this.get('xcEntity').getBareJID();
    }.property('xcEntity'),

    id: function(){
        return this.get('jid');
    }.property('jid'),

    //TODO: dependency should go down deeper than just xcEntity
    //Node is seen as username/name
    name: function(){
        var e = this.get('xcEntity');

        if(e) {
            return e.getJIDNode();
        }
        return null;
    }.property('xcEntity'),

    presence: function(key, value){
        // getter
        if (arguments.length === 1) {
            return this.get('xcEntity').presence;

        // setter
        } else {
            this.get('xcEntity').presence = value;

            return value;
        }
    }.property('xcEntity'),

    online: function(){
       var e = this.get('xcEntity');

       if(e){
           return this.get('xcEntity').presence.available; 
       }
       return null;
    }.property('presence'),

    sendChat: function(body, subject, thread, id){
        return this.get('xcEntity').sendChat(body, subject, thread, id);
    }
});
