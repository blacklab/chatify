
//----- Conversation -----------------------------------------------------------

/*
App.Message = Ember.Object.extend({
    id: null,
    from: null,
    to: null,
    body: null,
    createdAt: null,
    track: [],
    
    init: function () {
        this.set('createdAt', new Date());
    }
});
*/

//Controller

App.ConversationsConversationController = Ember.ObjectController.extend({

    sendChat: function(message){
        //Just proxy
        this.get('content').sendChat(message);
    }
});

//Model

App.Conversation = Ember.Object.extend({
    
    init: function(){
        this._super();

        console.log("Init called for App.Conversation");

        this.set('messages', []);
    },

    /* Adds a message to conversation store and sends it to friend in 
     * this conversation.
     */
    sendChat: function(message){
        if(xmppClient){
            message['to'] = this.get('friendJid')
            xmppClient.message(message['to'], message['body']);
            message = App.Conversation._extractTracks(message); 
            this.get('messages').pushObject(message);
        }
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
            this.store[id] = App.Conversation.create({friendJid: id});
        }
        return this.store[id];
    },

    /* Adds an array os Spotify track URIs to message.
     */
    _extractTracks: function(message){
        //Find all track links in message body
        var regexp = /spotify:track:[A-Za-z0-9]{22}/g;
        var track_uris = message.body.match(regexp);
    
        message.tracks = [];
        _.each(track_uris, function(uri){
            message.tracks.push(uri);
        });

        return message;
    },

    //Private Callbacks
    _onMessage: function(event, message){

        bare_jid = Strophe.getBareJidFromJid(message.from);
           
        if(message.body === "") return;
        message = this._extractTracks(message); 
        var conv = App.Conversation.find(bare_jid);
        conv.get('messages').pushObject(message);
    }
});
