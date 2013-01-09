var App = Ember.Application.create();
App.Models = {};
App.Controllers = {};
App.Controllers.Views = {};

//------------------------------------------------------------------------------
//----- Models -----------------------------------------------------------------

App.Models.Message = Ember.Object.extend({
    from: null,
    to: null,
    body: null,
    createdAt: null,

    init: function () {
        this.set('createdAt', new Date());
    }
});

//------------------------------------------------------------------------------
//----- Controllers ------------------------------------------------------------

App.Controllers.Conversations = Ember.ArrayProxy.create({
    content: [],
    
    onMessage: function(message){
        this.pushObject(message);
    }
});

App.ApplicationController = Ember.ObjectController.extend({
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
            jid: 'admin@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com',
            password: 'w1nkada',
            host: 'http://ec2-54-246-45-111.eu-west-1.compute.amazonaws.com/http-bind',
            debug: this.debug
        });

        this.client.connect();
    },
    
    //Private callbacks
    _onMessage: function (event, message) {
        App.Controllers.Conversations.onMessage(message);
    },
    
    //Public functions
    sendMessage: function (message) {
        this.client.message(message.get('to'), message.get('body'));
    }
});

//------------------------------------------------------------------------------
//----- Views ------------------------------------------------------------------

App.ApplicationView = Ember.View.extend({
  templateName: 'application',
});

App.ClickableView = Ember.View.extend({
  attributeBindings: ['href'],
  href: "#",
  templateName: 'click',
  
  click: function(evt) {
    dummy_message = App.Models.Message.create({from: "Roman", 
                                               to: "Karsten",
                                               body: "Yeah man!"});
                                               
    App.Controllers.Conversations.onMessage(dummy_message);
  }
});

App.Controllers.Views.MessageTextArea = Ember.TextArea.extend({
   classNames: ["message-text-area"],
   
    keyDown: function (event) {
            // Send message when Enter key is pressed
            if (event.which === 13 && !event.shiftKey) {
                event.preventDefault();
    
                message = App.Models.Message.create({
                    from: "admin@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com",
                    to: "karsten@ec2-54-246-45-111.eu-west-1.compute.amazonaws.com",
                    body: this.get('value'),
                    fromName: "Admin",
                    direction: 'outgoing'});
                                                           
                this.set('value', '');
                        
                //Send message
                App.router.applicationController.sendMessage(message);
                        
                //Display message because it won't be sent back                                   
                App.Controllers.Conversations.onMessage(message);  
            }
        }
});

App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
})

App.initialize();