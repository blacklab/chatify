// Holds messages between jids

EmberXmpp.Conversation = Ember.ArrayProxy.extend({
    content: null,
    to: null, //EmberXmpp.Entity The user the conversation is with

    init: function(){
        this._super();

        this.set('content', Em.A());
    },

    sendChat: function(body){
        var to = this.get('to');
        var message; // XC.MessageStanza

        if(to){
            message = to.sendChat(body);
        
            //TODO: extract tracks
            message.tracks = Em.A();

            //Add message to conversation
            var msg = EmberXmpp.Message.create({xcMessageStanza: message});
            this.pushObject(msg);
        }
    },

    /**
     * Message handler
     *
     * @param {XC.MessageStanza} message
     */
    onMessage: function(message){
        if(!message.body) return;
        if(message.body === "") return;

        //TODO: extract tracks
        message.tracks = Em.A();
        
        this.pushObject(EmberXmpp.Message.create({xcMessageStanza: message}));
    }
});
