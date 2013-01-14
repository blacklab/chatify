var App = Ember.Application.create({autoinit: false});

var spApi = getSpotifyApi();
var spModels = spApi.require("$api/models");
var spViews = spApi.require("$api/views");

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

//----- Application ------------------------------------------------------------

//TODO move this
App.user = Ember.Object.create({
    jid: 'karsten@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com',
    password: 'chatify',
    friendJid: 'roman@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com'
});

App.ApplicationController = Ember.Controller.extend({
    debug: true,

    //Constructor
    init : function(){
        
        // Bindings for XMPP client events
        //$.subscribe('roster.client.im', _.bind(this._onRoster, this));
        //$.subscribe('rosterChange.client.im', _.bind(this._onRosterChange, this));
        //$.subscribe('presence.client.im', _.bind(this._onPresenceChange, this));
        $.subscribe('message.client.im', this._onMessage);
        
        // XMPP client
        this.client = new IM.Client({
            jid: App.user.jid,
            password: App.user.password,
            host: 'http://ec2-54-246-45-111.eu-west-1.compute.amazonaws.com/http-bind',
            debug: this.debug
        });

        this.client.connect();
    },
    
    //Private callbacks
    _onMessage: function (event, message) {
        App.router.get('conversationController').onMessage(message);
    },
    
    //Public functions
    sendMessage: function (message) {
        this.client.message(message.get('to'), message.get('body'));
    }
});

App.ApplicationView = Ember.View.extend({
    templateName: 'application',
});

//----- Player -----------------------------------------------------------------
/*
App.PlayerController = Ember.ObjectController.extend({
    track1: null,
    track2: null,
    playlist: null,
    
    init: function(){
        console.log("Create PlayerController");
        this._super();
        
        this.set('track1', 
                 new spModels.Track.fromURI('spotify:track:0blzOIMnSXUKDsVSHpZtWL'));
                 
        this.set('track2',
                 new spModels.Track.fromURI('spotify:track:6zJms3MX11Qu1IKF44LoRW'));
        
        var playlist = new spModels.Playlist();
        playlist.add(this.get('track1'));
        playlist.add(this.get('track2'));
        
        this.set('playlist', playlist);
    },

    play: function(){
        spModels.player.play(this.track2, this.playlist, 1);
    }
});*/

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

//Login button view
App.Views.LoginButtonView = Ember.View.extend({
    templateName: "login-button",
    
    click: function(event){
        console.log("JID: " + App.user.jid + ", Password: " + App.user.password);
    }
})

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

App.Router = Ember.Router.extend({
    enableLogging: true,
    root: Ember.Route.extend({
        index: Ember.Route.extend({
          route: '/',
          connectOutlets: function(router){
            router.get('applicationController')
                  .connectOutlet({
                    outletName: 'conversation',
                    name: 'conversation',
                    context: []
                  });
          }
        })
    })
})

App.initialize();