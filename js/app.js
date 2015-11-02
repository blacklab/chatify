
//Handlebars.js Helpers

Ember.Handlebars.registerBoundHelper('join', function(items) {
    return items.join(",");
});

Ember.Handlebars.registerBoundHelper('uglyplayer', function(items) {
    var tracks = _.map(items, function(item){ return item.substring(14) }).join(",");
    return new Handlebars.SafeString(
          '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:CHATIFY:' +
          tracks + '"' +
          'frameborder="0" allowtransparency="true" height="800"></iframe>');
});

//Filter that converts markdown to html
Ember.Handlebars.registerBoundHelper('marked', function(markdown){
    var html = marked(markdown);

    return new Handlebars.SafeString(html);
});

//Instance of XMPP Client. TODO: Move to different place
var xmppConnection = null;


//----- Roster -----------------------------------------------------------------
App.RosterController = Ember.ObjectController.extend({
    content: null,
    
    init: function(){
        this._super();
    },
    
    /**
     * Property: returns true when roster was loaded.
     * Note: content.conten
     */
    loadedRoster: function(){
        return !(this.get('content.length') == null);
    }.property('content.length')

});

App.RosterView = Ember.View.extend({
   templateName: 'roster' 
});

//----- Login ------------------------------------------------------------------
App.LoginConnectController = Ember.ObjectController.extend({
    //statusBinding: Ember.Binding.oneWay('xmppConnection.status'),
    
    init: function(){
        this._super();
    },
    
    //Action: can be called when an error occured and user wants to go back to
    //login.index
    backToLogin: function(){
        //clean up
        this.set('error', null);
        this.transitionToRoute('login.index');
    },
/*
    status: function(){
        return xmppConnection.get('status');
    }.property("xmppConnection.status"),*/

    error: function(){
        return xmppConnection.get('status') != Strophe.CONNECTED;
    }.property('xmppConnection.status')
});

//----- Application ------------------------------------------------------------

//TODO move this
//Is bound in LoginView
App.user = Ember.Object.create({
    jid: 'karsten@karsten-n',
    password: ''
});

App.ApplicationController = Ember.Controller.extend({
    debug: true,

    //Constructor
    init : function(){
        this._super();
    },

    //Public functions
    connectXMPPClient: function() {
        
        // XMPP client
        xmppConnection = EmberXmpp.Connection.find(App.user.jid, 
                                               CONFIG.host, 
                                               App.user.password);        
        xmppConnection.connect(); 
    }
    
});

App.ApplicationView = Ember.View.extend({
    templateName: 'application'
});

//------------------------------------------------------------------------------
//----- Views ------------------------------------------------------------------

//TextArea View to send messages 
App.MessageTextAreaView = Ember.TextArea.extend({
    classNames: ["message-text-area"],
   
    keyDown: function (event) {
            // Send message when Enter key is pressed
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
    
                var message = this.get('value');
                                                           
                this.set('value', '');
           
                //Send message
                var ctrl = this.get('controller');
                console.log("Pressed enter:", ctrl);
                ctrl.sendChat(message);
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
        if(xmppConnection){
            if(xmppConnection.get('isConnected')){
                this.transitionTo('conversations.index');
            }
        }else {
            this.transitionTo('login.index');
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
    activate: function() {
        this.controllerFor("application").connectXMPPClient();

        //Observe xmppConnvetion.status. Transition once we are connected.
        //Bind this route to callback so we can transition
        xmppConnection.addObserver('status', this, function(){
            //Are we connected yet?
            if(xmppConnection.get('isConnected')){
                this.transitionTo('conversations.index');
            }
        });
    },

    deactivate: function(){
        //Remove observer again
        xmppConnection.removeObserver('status', this, function(){
            if(xmppConnection.get('isConnected')){
                this.transitionTo('conversations.index');
            }
        });
    }
});

App.LoginDisconnectRoute = Ember.Route.extend({
   activate: function(){
       xmppConnection.disconnect();

        //Observe xmppConnvetion.status. Transition once we are connected.
        //Bind this route to callback so we can transition
        xmppConnection.addObserver('status', this, function(){
            if(xmppConnection.get('isDisconnected')){
                this.transitionTo('login.index');
            }
        });
   },

   deactivate: function(){
        xmppConnection.removeObserver('status', this, function(){
            if(xmppConnection.get('isDisconnected')){
                this.transitionTo('login.index');
            }
        });
   }
});

App.ConversationsRoute = Ember.Route.extend({

    setupController: function(controller, model){
        
        //Set EmberXmpp.Roster as content
        this.controllerFor('roster')
            .set('content', xmppConnection.get('roster'));
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

        //model is of type EmberXmpp.Entity. Find conversation...
        conv = xmppConnection.findConversation(model.get('id'));
        controller.set("content", conv);
    },
    
    renderTemplate: function() {
        this.render('conversations/conversation', {
            outlet: "conversation"
        });
    }
});

App.initialize();
