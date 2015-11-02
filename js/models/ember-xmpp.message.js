//EmberXmpp.Message model is a small wrapper for XC.MessageStanza

EmberXmpp.Message = Ember.Object.extend({
    xcMessageStanza: null,

    /**
     * Getter for sender's jid.
     * @return {String} Full JID with resource of sender.
     */
    from: function(){
        var from = this.get('xcMessageStanza').from;

        if(from) return from.jid;
        return "";
    }.property('xcMessageStanza'),

    /**
     * Getter for recevier's jid.
     * @return {String} Full JID with resource of receiver.
     */
    to: function(){
        return this.get('xcMessageStanza').to.jid;
    }.property('xcMessageStanza'),

    /**
     * Getter for body of message.
     * @return {String} The message body
     */
    body: function(){
        console.log(this.get('xcMessageStanza'));
        return this.get('xcMessageStanza').body;
    }.property('xcMessageStanza')
});

//Static members
EmberXmpp.Message.reopenClass({

    /**
     * Create a new EmberXmpp.Message instance.
     *
     * @param {Object} obj Fields for model MUST include xcMessageStanza field
     *
     * @return {EmberXmpp.Message} A new message model
     */
    create: function(obj){
        if(!obj.hasOwnProperty('xcMessageStanza')){
            throw new Ember.Error('EmberXmpp.Message.create() expects the field: '+
                                  'xcMessageStanza.');
        }

        if(!obj.xcMessageStanza){
            throw new Ember.Error("EmberXmpp.Message.create() xcMessageStanza " +
                                  "field must not be null.");
        }

        return this._super(obj);
    }

});
