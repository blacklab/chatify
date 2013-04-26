// Holds messages between jids

EmberXmpp.Conversation = Ember.ArrayProxy.extend({
    content: null,

    init: function(){
        this._super();

        this.set('content', Em.A());
    },

    //Callback
    onMessage: function(message){

        if(message.body === "") return;

        this.get('content').pushObject(message);
    }
});

//Static members

EmberXmpp.Conversation = EmberXmpp.Conversation.reopenClass({
    store: {},

    find: function(id){

        if(!this.store[id]){
            this.store[id] = EmberXmpp.Conversation.create();
        }
        return this.store[id];
    }
});
