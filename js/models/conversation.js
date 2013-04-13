
//----- Conversation -----------------------------------------------------------

//Model

App.Conversation = Ember.Object.extend({
    
    init: function(){
        this._super();

        console.log("Init called for App.Conversation");

        this.set('messages', []);
        this.set('talkingPartner', null);
    }

});

//Static members
App.Conversation = App.Conversation.reopenClass({

    store: {},
    subscribed: false,

    //TODO: this might have to be moved
    subscribe: function(){

        //subscribe to incoming messages only once.
        if(!this.subscribed){
            console.log("Bind to XMPP client.");

            //Binding for XMPP client event
            $.subscribe('message.client.im', _.bind(this._onMessage, this));
            this.subscribed = true;
        }

    },

    find: function(id){

        if(!this.store[id]){
            this.store[id] = App.Conversation.create();
        }
        return this.store[id];
    },

    //Private Callbacks
    _onMessage: function(event, message){

        bare_jid = Strophe.getBareJidFromJid(message.from);
           
        if(message.body === "") return;
        //Find all track links in message body
        var regexp = /spotify:track:[A-Za-z0-9]{22}/g;
        var track_uris = message.body.match(regexp);
    
        message.tracks = [];
        _.each(track_uris, function(uri){
            message.tracks.push(uri);
        });
        
        var conv = App.Conversation.find(bare_jid);
        conv.get('messages').pushObject(message);
    }
});
