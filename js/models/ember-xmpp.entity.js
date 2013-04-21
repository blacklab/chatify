//Handles entity callbacks and actions on entities such as sendChat..

EmberXmpp.Entity = Ember.Object.extend({
    
    xcEntity: null,

    init: function(){
        this._super();
    },

    //TODO: dependency should go down deeper than just xcEntity
    //Node is seen as username/name
    name: function(){
        var e = this.get('xcEntity');

        if(e) {
            return e.getJIDNode();
        }
        return null;
    }.property('xcEntity'),

    //TODO: check xcEntity for null
    online: function(){
       return this.get('xcEntity').presence.available; 
    }.property('xcEntity'),

    sendChat: function(body, subject, thread, id){
        this.get('xcEntity').sendChat(body, subject, thread, id);
    }
});
