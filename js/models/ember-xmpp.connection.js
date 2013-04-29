EmberXmpp = {};

EmberXmpp.Connection = Ember.Object.extend({
    host: null,
    jid: null,
    password: null,
    status: null,

    roster: null, //Ember.Array
    conversations: null, //Ember.Map

    //TODO: should this be global?
    xc: null,

    init: function(){
        this._super();

        this.set('roster', EmberXmpp.Roster.create());
        this.set('conversations', Ember.Map.create());
    },

    getRoster: function(){
        return this.get('roster');
    },

    /**
     * Looks for the conversation with a user. If no conversation is found a 
     * new is created.
     *
     * @param {String} bareJID The bare jid of the user the conversations is with.
     * @return {EmberXmpp.Conversation} A conversation if contact exists in roster.
     */
    findConversation: function(bareJID){
        var conversations = this.get('conversations');

        if(!conversations.has(bareJID)){
            var entity = this.get('roster').getContact(bareJID);

            if(!entity) return;

            conversations.set(bareJID, 
                              EmberXmpp.Conversation.create({entity: entity})
                             );
        }

        return conversations.get(bareJID);
    },

    connect: function(){
        this.get('xc').connect(_.bind(this.onConnect, this));
    },

    disconnect: function(){
        this.get('xc').Presence.sendUnavailable();
        this.get('xc').disconnect();
    },

    //Properties -------------------------------------------------------------

    isConnected: function(){
        return this.get('status') == Strophe.Status.CONNECTED;
    }.property('status'),
    
    isDisconnected: function(){
        return this.get('status') == Strophe.Status.DISCONNECTED;
    }.property('status'),

    //Callbacks --------------------------------------------------------------

    //TODO: get status message as second parameter
    onConnect: function(status) {
        var xc = this.get('xc');
        console.log("Status: " + status);
   
        this.set('status', status);

        if(status == Strophe.Status.CONNECTED){
            //Send own presence and request roster once we connected.
            xc.Roster.requestItems();
            xc.Presence.send();
        }
    },

    /**
     * Callback for XC.Chat service
     *
     * @param {XC.MessageStanza} message
     */
    onMessage: function(message){
        var conv = this.get('conversations').get(message.from.getBareJID());

        if(conv){
            conv.onMessage(message);
        }
    }
});


//Static members
EmberXmpp.Connection = EmberXmpp.Connection.reopenClass({
    store: {},

    /**
     * @param {Object} options Should include jid, host and password fields.
     * @param {function} onConnect Callback for connection. status is passed as
     *        parameter.
     */
    getConnectionAdapter: function(options){
        var bosh, adapter;
        
        //Create a new strophe connection
        bosh = new Strophe.Connection(options.host);
       
        //Create adapter
        adapter = XC.StropheAdapter.extend({
            connection: bosh,

            /**
             * We add a connect function for XC.Connection to call.
             * TODO: This could be moved some time into XC.
             * @param {Function} callback A callback for Strope.
             */
            connect: function(callback){
                this.connection.connect(options.jid, 
                                        options.password, 
                                        callback);
            },

            /**
             * Disconnects client.
             */
            disconnect: function(){
                this.connection.flush();
                this.connection.disconnect();
            }
        });

        return adapter; 
    },

    /**
     * @param {String} host Address to connect to.
     * @param {JID} jid The jid of the user.
     */
    createRecord: function(jid, host, password){
        var connection, xc, adapter, roster;

        //Create Ember model
        connection = EmberXmpp.Connection.create({'jid': jid,
                                                  'password': password,
                                                  'host': host});

        //Create connection adapter
        adapter = this.getConnectionAdapter({'jid': jid,
                                             'password': password,
                                             'host': host
                                            }
                                           );
        
        //Create an XC.Connection instance with a Strophe adapter
        xc = XC.Connection.extend({
                connectionAdapter: adapter,

                /**
                 * We add a connect function so we can connect after we 
                 * registered all handlers.
                 * The adapter needs to be extended as done in 
                 * getConnectionAdapter
                 *
                 * @param {Function} callback This callback is for Strope.
                 */
                connect: function(callback){
                    this.connectionAdapter.connect(callback);
                },

                /**
                 * Lets adapter discconect client.
                 */
                disconnect: function(){
                    this.connectionAdapter.disconnect();
                }
             }); 

        //Set and XC.Connection for EmberXmpp.Connection model
        connection.set('xc', xc);
        
        //Register handlers
        roster = connection.get('roster');
        xc.Presence.registerHandler('onPresence', roster.onPresence, roster);
        xc.Roster.registerHandler('onRosterItems', roster.onRosterItems, roster);

        xc.Chat.registerHandler('onMessage', connection.onMessage, connection);

        return connection;
    },

    /**
     * Looks up the connection which belongs to jid and host. If there is no
     * connection a new model instance is created.
     * NOTE: The connection is only established as soon as connect is called!
     *
     * @param {String} jid The JID of the user which should be connected.
     * @param {String} host The host to connect to.
     *
     * @retrun A connection corresponding to jid and host
     */
    find: function(jid, host, password){
        var id = jid + "_" + host;

        if(!this.store[id]){
            this.store[id] = EmberXmpp.Connection.createRecord(jid, 
                                                               host, 
                                                               password);
        }
        return this.store[id];
    }
});
