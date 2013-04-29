// Holds messages between jids

EmberXmpp.Conversation = Ember.ArrayProxy.extend({
    content: null,
    entity: null, //EmberXmpp.Entity The user the conversation is with

    init: function(){
        this._super();

        this.set('content', Em.A());
    },

    sendChat: function(body){
        var entity = this.get('entity');

        if(entity){
            entity.sendChat(body);

            //Add message to conversation
            this.get('content').pushObject({body: body});
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
        
        this.get('content').pushObject(message);
    }
});
