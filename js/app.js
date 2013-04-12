
var App = Ember.Application.create({
    autoinit: false,
    LOG_TRANSITIONS: true
});
/*
var spApi = getSpotifyApi();
var spModels = spApi.require("$api/models");
var spViews = spApi.require("$api/views");*/

App.Views = {};

//Basic config
var CONFIG = {
                host: "http://localhost:5280/http-bind/"//'http://ec2-46-51-139-70.eu-west-1.compute.amazonaws.com/http-bind'
             };


//----- Models -----------------------------------------------------------------

App.MessageModel = Ember.Object.extend({
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

App.ResourceModel = Ember.Object.extend({
    // Default attribute values
    show: null,
    status: null
});

App.UserModel = Ember.Object.extend({
    // Default attribute values
    jid: null,
    subscription: 'none',
    resources: null, // Set of opened connections
    
    init: function () {
        // We have to initialize 'resources' inside init function,
        // because otherwise all User objects would use the same Set object
        this.set('resources', []);
    },
    
    name: function () {
        var jid = this.get('jid');
        return jid ? Strophe.getNodeFromJid(jid) : jid;
    }.property('jid').cacheable(),

    id: function(){
        return this.get('jid');
    }.property('jid').cacheable(),
    
    presence: function () {
        return this.get('resources').length ? 'available' : 'unavailable';
    }.property('resources.length').cacheable(),
    
    online: function() {
        return this.get('presence') === 'available';
    }.property('presence'),
    
    setPresence: function (presence) {
        var resources = this.get('resources'),
            id = Strophe.getResourceFromJid(presence.from),
            resource = resources.findProperty('id', id);

        if (presence.type === 'unavailable' && resource) {
            resources.removeObject(resource);
        } else {
            if (resource) {
                // TODO: set both properties at once?
                resource.set('show', presence.show);
                resource.set('status', presence.status);
            } else {
                resource = App.ResourceModel.create({
                    id: id,
                    show: presence.show,
                    status: presence.status
                });
                resources.addObject(resource);
            }
        }
        
        return resource;
    }
});


//----- Conversation -----------------------------------------------------------

//Model

App.Conversation = Ember.Object.extend({
    messages: [],
    talkingPartner: null,
    
    init: function(){
        this._super();

        console.log("Init called for App.Conversation");

        //Binding for XMPP client event
        $.subscribe('message.client.im', _.bind(this._onMessage, this));
    },

    //Private Callbacks
    _onMessage: function(event, message){

        console.log("Received message");
                    
        //Find all track links in message body
        var regexp = /spotify:track:[A-Za-z0-9]{22}/g;
        var track_uris = message.body.match(regexp);
        /*
        message.tracks = [];
        _.each(track_uris, function(uri){
            message.tracks.push(new spModels.Track.fromURI(uri));
        });*/

        this.find(message.jid).messages.pushObject(message);
    }
});

App.Conversation = Ember.Object.reopenClass({

    store: {},

    find: function(id){
        if(!this.store[id]){
            this.store[id] = App.Conversation.create();
        }
        return this.store[id];
    }
});

App.ConversationsIndexController = Ember.ArrayController.extend({});

App.ConversationsConversationController = Ember.ObjectController.extend({
});

//----- Roster -----------------------------------------------------------------
App.RosterController = Ember.ArrayProxy.extend({
    content: null,
    
    conversations: [
                    {
                        name: "Roman",
                        id: "b.15"
                      }, {
                        name: "Julika",
                        id: "b.133"
                      }, {
                        name: "Romina",
                        id: "b.126"
                      }
                    ],
    
    init: function(){
        this._super();
        // Bindings for XMPP client events
        $.subscribe('roster.client.im', _.bind(this._onRoster, this));
        //$.subscribe('rosterChange.client.im', _.bind(this._onRosterChange, this));
        
        $.subscribe('presence.client.im', _.bind(this._onPresenceChange, this));
    },
    
    setFriendPresence: function (presence) {
        var fullJid = presence.from,
            bareJid = Strophe.getBareJidFromJid(fullJid),
            friend = this.findProperty('jid', bareJid);

        if (friend) {
            friend.setPresence(presence);
        } else {
            // Something went wrong. 
            // Got presence notification from user not in the roster.
            console.warn('Presence update from user not in the roster: ' + fullJid + ':' + presence.type);
        }
    },
    
    //Property: returns true when roster was loaded.
    loadedRoster: function(){
        return this.get('content') == null;
    }.property('loadedRoster'),
    
    //Private Callbacks
    _onRoster: function (event, friends) {
        console.log("onRoster");
        
        var objects = _.map(friends, function (friend) {
            return App.UserModel.create(friend);
        });

        this.set('content', objects);
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

App.RosterView = Ember.View.extend({
   templateName: 'roster' 
});

//----- Login ------------------------------------------------------------------
App.LoginIndexController = Ember.ObjectController.extend({
   loggedIn: null,
   
   //needs: ['application', 'loginConnect'],
   
   init: function() {
     this._super();
     this.set('loggedIn', false);  
   },
   
   setStatus: function(status){
     this.set('loggedIn', status);  
   },
  
   isLoggedIn: function() {
      return this.get('loggedIn');
   }
});

App.LoginConnectController = Ember.ObjectController.extend({
    error: null,
    //needs: "loginIndex",
    //loginIndexBinding: "controllers.loginIndex",
    
    init: function(){
        this._super();
        this.set('error', null);
        
        $.subscribe('connected.client.im', _.bind(this._onConnected, this));  
        
        $.subscribe('error.client.im',  _.bind(this._onError, this));
        $.subscribe('connfail.client.im',  _.bind(this._onError, this));
        $.subscribe('authfail.client.im',  _.bind(this._onError, this));
    },
    
    //Action: can be called when an error occured and user wants to go back to
    //login.index
    backToLogin: function(){
        //clean up
        this.set('error', null);
        this.transitionToRoute('login.index');
    },
    
    //Private callbacks
    _onError: function(event, status){
        this.set('error', "Error: " + status + " - " + event.type);
        this.controllerFor('loginIndex').setStatus(false);
    },
    
    _onConnected: function(){
        this.set('error', null);
        this.controllerFor('loginIndex').setStatus(true);
        
        console.log("Connected to XMPP server");
        this.transitionToRoute('conversations.index');
    }
});

App.LoginDisconnectController = Ember.ObjectController.extend({
    //needs: "loginIndex",
    //loginIndexBinding: "controllers.loginIndex",
    
    init: function(){
        this._super();
        $.subscribe('diconnected.client.im', _.bind(this._onDisconnected, this));  
    },

    
    //Private callbacks
    _onDisconnected: function(){
        this.controllerFor('loginIndex').setStatus(false);
        
        console.log("Disconnected from XMPP server");
        this.transitionToRoute('login.index');
    }
});

//----- Application ------------------------------------------------------------

//TODO move this
//Is bound in LoginView
App.user = Ember.Object.create({
    jid: 'karsten@karsten-n',
    password: 'chatify',
    friendJid: 'roman@karsten-n'
});

App.ApplicationController = Ember.Controller.extend({
    debug: true,
    xmppClient: null,

    //Constructor
    init : function(){
        this._super();
    },

    //Public functions
    connectXMPPClient: function() {
        
        // XMPP client
        var tmp_client = new IM.Client({
            jid: App.user.jid,
            password: App.user.password,
            host: CONFIG.host,
            debug: this.debug
        });
        
        this.set('xmppClient', tmp_client);
        
        this.get('xmppClient').connect(); 
    },
    
    disconnectXMPPClient: function() {
        this.get('xmppClient').disconnect(); 
    },
    
    sendMessage: function (message) {
        this.client.message(message.get('to'), message.get('body'));
    }
});

App.ApplicationView = Ember.View.extend({
    templateName: 'application',
});

//----- Player -----------------------------------------------------------------
App.PlayerListView = Ember.View.extend({
    templateName: "player",
    list: null, //Spotify Playlist View
    
    //this should be in a controller
    playlist: null,
    
    init : function(){
        this._super();
        
        /*
        //the following should be in a controller
        var playlist = new spModels.Playlist();
        _.each(this.get('tracks'), function(track){
            playlist.add(track);
        });
        
        this.set('playlist', playlist);*/
    },
    
    didInsertElement: function(){
        /*
        this.set('list', new spViews.List(this.get('playlist')));
        this.get('list').node.classList.add('sp-light');
        $(this.get('element')).append(this.get('list').node); */
    }
});

//------------------------------------------------------------------------------
//----- Views ------------------------------------------------------------------

//TextArea View to send messages 
App.Views.MessageTextArea = Ember.TextArea.extend({
   classNames: ["message-text-area"],
   
    keyDown: function (event) {
            // Send message when Enter key is pressed
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
    
                message = App.MessageModel.create({
                    from: App.user.jid,
                    to: App.user.friendJid,
                    body: this.get('value'),
                    fromName: "Admin",
                    direction: 'outgoing'});
                                                           
                this.set('value', '');
           
                //Send message
                App.router.applicationController.sendMessage(message);
                        
                //Display message because it won't be sent back                                   
                App.router.get('conversationController').onMessage(message);  
            }
        }
});

//----- Routing ----------------------------------------------------------------
/*
App.Router.reopen({
    location: 'history'
  });*/

App.Router.map(function(){
    this.route("index", {path: "/index.html"});
    this.resource("login", function(){
        this.route("connect"); 
        this.route("disconnect"); 
    });

    // ConversationsRoute - #/conversation
    this.resource('conversations', { path: '/conversation' }, function() {            
        // ConversationsIndexRoute - #/conversation/

        // ConversationsConversationRoute - #/conversation/<conversation_id_here>
        this.route('conversation', { path: '/:conversation_id' });    });
});

App.IndexRoute = Ember.Route.extend({
    redirect: function() {
        if(this.controllerFor('loginIndex').isLoggedIn() == false){
            this.transitionTo('login');
        }else {
            this.transitionTo('conversation');
        }
        
    }
});
    
App.LoginRoute = Ember.Route.extend({
    activate : function() {
        console.log("Enter login");
    }
});

App.LoginIndexRoute = Ember.Route.extend({
    activate : function() {
        console.log("Enter login.index");
    },
    
    renderTemplate: function() {
        this.render('login/index', {
            into: 'login'
        });
      }
});

App.LoginConnectRoute = Ember.Route.extend({
    activate : function() {
        this.controllerFor("application").connectXMPPClient();
    }
});

App.LoginDisconnectRoute = Ember.Route.extend({
   activate: function(){
       this.controllerFor("application").disconnectXMPPClient();
   } 
});

App.ConversationsRoute = Ember.Route.extend({

    renderTemplate: function() {
        this.render('conversations');
        
        this.render('roster', {
            into: 'conversations',
            outlet: 'roster',
            controller: 'roster'
        });
    }
});

// 'conversation/' Conversations/Index
App.ConversationsIndexRoute = Ember.Route.extend({
    
    activate : function() {
        console.log("Enter conversation");
        
        var status = this.controllerFor('loginIndex').isLoggedIn();
        
        console.log("Loggedin: " + status);
    },
    
    renderTemplate: function() {
        this.render('conversations/index', {
            outlet: 'conversation'
        });
    }
});

App.TestObject = Ember.Object.extend({
    init: function(){
        console.log("init called on test object");
        this._super();
    },
});

// 'conversation/:conversation_id' Conversations/Conversation
App.ConversationsConversationRoute = Ember.Route.extend({
    
    model: function(params){
        console.log("Parameters: " + params);
        
        return {id: params.conversation_id, name: "hi"};
    },
    
    setupController: function(controller, model) {

        var msg = App.MessageModel.create({
            from: "karsten",
            to: "roman",
            body: "hello",
            direction: 'outgoing',
            id: 1
        });

        //model is of type user. Find conversation...
        App.TestObject.create();
        App.TestObject.create();
        conv = App.Conversation.find(model.get('id'));
        conv.set('talkingPartner', model);
        conv.set('messages', [msg]);
                         
        controller.set("content", conv);
    },
    
    renderTemplate: function() {
        this.render('conversations/conversation', {
            outlet: "conversation"
        });
    }
});

App.initialize();
