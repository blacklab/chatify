EmberXmpp = {};

EmberXmpp.Connection = Ember.Object.extend({
    host: null,
    jid: null,
    password: null,
    status: null,

    roster: null,

    //TODO: should this be global?
    xc: null,

    init: function(){
        this._super();

        this.set('roster', EmberXmpp.Roster.create());
    },

    getRoster: function(){
        return this.get('roster');
    },

    connect: function(){
        this.get('xc').connect(_.bind(this.onConnect, this));
    },

    disconnect: function(){
        this.get('xc').Presence.sendUnavailable();
        this.get('xc').disconnect();
    },

    isConnected: function(){
        return this.get('status') == Strophe.Status.CONNECTED;
    }.property('status'),
    
    isDisconnected: function(){
        return this.get('status') == Strophe.Status.DISCONNECTED;
    }.property('status'),

    //TODO: this callback might be on class base not instance. Check it!
    onConnect: function(status) {
        var xc = this.get('xc');
        console.log("Status: " + status);
   
        this.set('status', status);

        if(status == Strophe.Status.CONNECTED){
            //Send own presence and request roster once we connected.
            xc.Roster.requestItems();
            xc.Presence.send();
        }

        /*
        var Status = Strophe.Status;

        switch (status) {
        case Status.ERROR:
            $.publish('error.client.im', status);
            break;
        case Status.CONNECTING:
            $.publish('connecting.client.im', status);
            break;
        case Status.CONNFAIL:
            $.publish('connfail.client.im', status);
            break;
        case Status.AUTHENTICATING:
            $.publish('authenticating.client.im', status);
            break;
        case Status.AUTHFAIL:
            $.publish('authfail.client.im', status);
            break;
        case Status.CONNECTED:
            this._onConnected();
            $.publish('connected.client.im', status);
            break;
        case Status.DISCONNECTING:
            $.publish('diconnecting.client.im', status);
            break;
        case Status.DISCONNECTED:
            $.publish('diconnected.client.im', status);
            break;
        case Status.ATTACHED:
            $.publish('attached.client.im', status);
            break;
        }

        return true;*/
    },
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
        xc.Presence.registerHandler('onPresence', 
                                    _.bind(roster.onPresence, roster));

        xc.Roster.registerHandler('onRosterItems', 
                                  _.bind(roster.onRosterItems, roster));

        //TODO: listen on messages
        //var conversation = connection.get('conversation');
        //xc.Chat.registerHandler('onMessage',
        //                        _.bind(conversation.onMessage, conversation));

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
