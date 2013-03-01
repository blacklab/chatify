var App = Ember.Application.create({autoinit: false});

/*
var spApi = getSpotifyApi();
var spModels = spApi.require("$api/models");
var spViews = spApi.require("$api/views");
*/
App.Views = {};


//----- Models -----------------------------------------------------------------

App.MessageModel = Ember.Object.extend({
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
App.ConversationController = Ember.ArrayProxy.extend({
    content: [],
    
    onMessage: function(message){
        
        //Find all track links in message body
        var regexp = /spotify:track:[A-Za-z0-9]{22}/g;
        var track_uris = message.body.match(regexp);
        
        message.tracks = [];
        _.each(track_uris, function(uri){
            message.tracks.push(new spModels.Track.fromURI(uri));
        });

        this.pushObject(message);
    }
});

App.ConversationView = Ember.View.extend({
    templateName: 'conversation'
});

//----- Roster -----------------------------------------------------------------
App.RosterController = Ember.ArrayProxy.extend({
    content: [],
    
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
    }
});

App.RosterView = Ember.View.extend({
   templateName: 'roster' 
});

//----- Login ------------------------------------------------------------------
App.LoginIndexController = Ember.ObjectController.extend({
   loggedIn: null,
   
   //needs: ['application', 'loginConnect'],
   
   init: function() {
     this.set('loggedIn', false);  
   },

   //click on login button
   login: function() {

       this.controllerFor('loginConnect').set('error', null); 
       this.controllerFor("application").connectXMPPClient();
       this.transitionToRoute('login.connect');
   },
  
  isLoggedIn: function() {
      return this.get('loggedIn');
  }
});

/*
App.LoginView = Ember.View.extend({
   templateName: "login" 
});*/

App.LoginConnectController = Ember.ObjectController.extend({
    error: null,
    
    init: function(){
        this.set('error', null);
        
        $.subscribe('connected.client.im', _.bind(this._onConnected, this));  
        
        $.subscribe('error.client.im',  _.bind(this._onError, this));
        $.subscribe('connfail.client.im',  _.bind(this._onError, this));
        $.subscribe('authfail.client.im',  _.bind(this._onError, this));
    },
    
    backToLogin: function(){
        //clean up
        this.set('error', null);
        this.transitionToRoute('login.index');
    },
    
    //Private callbacks
    _onError: function(event, status){
        this.set('error', "Error: " + status + " - " + event.type);
    },
    
    _onConnected: function(){
        this.set('error', null);
        
        console.log("Connected to XMPP server");
        this.transitionToRoute('conversation');
    }
});

//----- Application ------------------------------------------------------------

//TODO move this
//Is bound in LoginView
App.user = Ember.Object.create({
    jid: 'roman@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com',
    password: 'chatify',
    friendJid: 'karsten@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com'
});

App.ApplicationController = Ember.Controller.extend({
    debug: true,
    xmppClient: null,

    //Constructor
    init : function(){
        
        // Bindings for XMPP client events
        $.subscribe('roster.client.im', _.bind(this._onRoster, this));
        //$.subscribe('rosterChange.client.im', _.bind(this._onRosterChange, this));
        $.subscribe('presence.client.im', _.bind(this._onPresenceChange, this));
        $.subscribe('message.client.im', this._onMessage);
    },
    
    //Private callbacks
    _onMessage: function (event, message) {
        App.router.get('conversationController').onMessage(message);
    },
    
    _onRoster: function (event, friends) {
        var objects = _.map(friends, function (friend) {
            return App.UserModel.create(friend);
        });

        App.router.get('rosterController').set('content', objects);
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
                App.router.get('rosterController').setFriendPresence(presence);
            }
        }
    },
    
    //Public functions
    connectXMPPClient: function() {
        
        // XMPP client
        var tmp_client = new IM.Client({
            jid: App.user.jid,
            password: App.user.password,
            host: 'http://ec2-54-246-45-111.eu-west-1.compute.amazonaws.com/http-bind',
            debug: this.debug
        });
        
        this.set('xmppClient', tmp_client);
        
        this.get('xmppClient').connect(); 
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
        
        //the following should be in a controller
        var playlist = new spModels.Playlist();
        _.each(this.get('tracks'), function(track){
            playlist.add(track);
        });
        
        this.set('playlist', playlist);
    },
    
    didInsertElement: function(){
        this.set('list', new spViews.List(this.get('playlist')));
        this.get('list').node.classList.add('sp-light');
        $(this.get('element')).append(this.get('list').node); 
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

App.Router.reopen({
    location: 'history'
  });

App.Router.map(function(){
    this.route("index", {path: "/index.html"});
    this.resource("login", function(){
        this.route("connect"); 
    });
    this.route("conversation", {path: "/conversation"});
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
    },  
    
    renderTemplate: function() {
        this.render();
      }
});

App.LoginIndexRoute = Ember.Route.extend({
    activate : function() {
        console.log("Enter login.index");
    }
});

App.LoginConnectRoute = Ember.Route.extend({
    activate : function() {
        console.log("Enter login.connect");
    }
});

App.ConversationRoute = Ember.Route.extend({
    activate : function() {
        console.log("Enter conversation");
        
        var status = this.controllerFor('loginIndex').isLoggedIn()
        
        console.log(status);
    },  
    
    renderTemplate: function() {
        this.render();
      }
});

/*
App.Router = Ember.Router.extend({
    enableLogging: true,
    root: Ember.Route.extend({
        login: Ember.Route.extend({
            route: '/',
            connectOutlets: function(router){
                router.get('applicationController')
                  .connectOutlet({
                      name: 'login'
                  }); 
            }
        }),
        conversation: Ember.Route.extend({
          route: '/conversation',
          connectOutlets: function(router){
            router.get('applicationController')
                  .connectOutlet({
                    name: 'conversation',
                    context: []
                  });
   /*
            router.get('conversationController')
                  .connectOutlet({
                    outletName: 'roster',
                    name: 'roster',
                    context: []
                  });*
          }
        })
    })
});*/

App.initialize();