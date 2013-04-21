EmberXmpp = {};

EmberXmpp.Connection = Ember.Object.extend({
    host: null,
    jid: null,
    password: null,
    connectionStatus: null,

    roster: null,

    //TODO: should this be global?
    bosh: null,
    xc: null,

    init: function(){
        this.super();

        this.set('roster', EmberXmpp.Roster.create());
    },

    getRoster: function(){
        return this.get('roster');
    },


    //TODO: this callback might be on class base not istance. Check it!
    _onConnect: function(status) {
        console.log("Status: " + status);
   
        this.set('connectionStatus', status);

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

    //TODO: this callback might not work on instance base. Check it!
    _onConnected: function(){
        var xc = this.get('xc');

        //Send own presence and request roster
        xc.Presence.send();
        xc.Roster.requestItems();
    }
});


//Static members
EmberXmpp.Connection = EmberXmpp.Connection.reopenClass({
    store: {},

    create: function(host, jid, password){
        var connection, bosh, xc;

        //Create a new strophe connection
        bosh = new Strophe.Connection(host);
        bosh.connect(jid, password, _.bind(connection._onConnect, this));
        
        //Create an XC instance with a Strophe adapter
        xc = XC.Connection.extend({
            connectionAdapter: XC.StropheAdapter.extend({connection: strophe})
        }); 

        //Create Ember model
        connection = EmberXmpp.Connection.create({'jid': jid,
                                                  'password': password,
                                                  'host': host,
                                                  'bosh': bosh,
                                                  'xc': xc});
        
        roster = connection.get('roster');

        //Register handlers
        xc.Presence.registerHandler('onPresence', 
                                    _.bind(roster.onPresence, roster));
        xc.Roster.registerHandler('onRosterItems', 
                                  _.bind(roster.onRosterItems, roster));

        //TODO: listen on messages
        //var conversation = connection.get('conversation');
        //xc.Chat.registerHandler('onMessage',
        //                        _.bind(conversation.onMessage, conversation));

        //Add connection to store
        this.store[jid + "_" + host] = connection;
    }
});
