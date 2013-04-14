/* Is defined in index now
var App = Ember.Application.create({
    autoinit: false,
    LOG_TRANSITIONS: true
});
*/
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

//----- Roster -----------------------------------------------------------------
App.RosterController = Ember.ObjectController.extend({
    content: null,
    
    init: function(){
        this._super();
    },
    
    //Property: returns true when roster was loaded.
    loadedRoster: function(){
        return !(this.get('content').get('friends') == null);
    }.property('content.friends'),

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

App.RosterRoute = Ember.Route.extend({
    model: function(){
        console.log("RosterRoute.model called");
        return [];
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

    setupController: function(controller, model){
        console.log("Setup controller in ConversationsRoute");

        var roster = App.Roster.create();
        //TODO: this might have to move somewhere else
        roster._subscribe();
        this.controllerFor('roster')
            .set('content', roster);

        console.log("Found controller");
    },

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

// 'conversation/:conversation_id' Conversations/Conversation
App.ConversationsConversationRoute = Ember.Route.extend({
    
    model: function(params){
        console.log("Parameters: " + params);
    
        //TODO: retrieve/create model
        return null;
    },
    
    setupController: function(controller, model) {

        //model is of type user. Find conversation...
        conv = App.Conversation.find(model.get('id'));
        controller.set("content", conv);
    },
    
    renderTemplate: function() {
        this.render('conversations/conversation', {
            outlet: "conversation"
        });
    }
});

//init XMPPBindings
//TODO: move this to a nicer place
App.Conversation.subscribe();

App.initialize();
