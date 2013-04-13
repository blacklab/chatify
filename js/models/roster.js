
//----- Roster ----------------------------------------------------------------

//Model

App.Roster = Ember.Object.extend({

    init: function(){
        this._super();
        this.set('subscribed', false);
        this.set('friends', null);
    },

    //TODO: this might have to be moved
    _subscribe: function(){

        //subscribe to incoming messages only once.
        if(!this.get('subscribed')){
            console.log("Bind to XMPP client.");

            // Bindings for XMPP client events
            $.subscribe('roster.client.im', _.bind(this._onRoster, this));
            //$.subscribe('rosterChange.client.im', _.bind(this._onRosterChange, this));
        
            //$.subscribe('presence.client.im', _.bind(this._onPresenceChange, this));
            
            this.set('subscribed',true);
        }

    },

    find: function(id){
        console.log("Find is called for roster");
    },
    
    setFriendPresence: function (presence) {
        var fullJid = presence.from,
            bareJid = Strophe.getBareJidFromJid(fullJid),
            friend = this.get('store')[bareJid];

        if (friend) {
            friend.setPresence(presence);
        } else {
            // Something went wrong. 
            // Got presence notification from user not in the roster.
            console.warn('Presence update from user not in the roster: ' + fullJid + ':' + presence.type);
        }
    },

    //Private Callbacks
    _onRoster: function (event, friends) {
       
        var roster_object = this;

        var objects = Em.A();
        _.map(friends, function (friend) {
            bare_jid = Strophe.getBareJidFromJid(friend.jid);
            objects.push(App.User.create(friend));
        });

        this.set('friends', objects);
    },

    _onPresenceChange: function (event, presence) {
        var fullJid = presence.from,
            bareJid = Strophe.getBareJidFromJid(fullJid);

        switch (presence.type) {
        case 'error':
            // do something
            break;
        case 'subscribe':
            // authorization request
            break;
        case 'unsubscribe':
            // deauthorization request
            break;
        case 'subscribed':
            // authorization confirmed
            break;
        case 'unsubscribed':
            // deauthorization confirmed
            break;
        default:
            // Update user's or friend's presence status
            if (App.user.get('jid') === bareJid) {
                //TODO: set own presence
                console.log("TODO: set own presence");
                //this.setUserPresence(presence);
            } else {
                this.setFriendPresence(presence);
            }
        }
    },
});

//Static members
App.Roster = App.Roster.reopenClass({
});
