//Just create Ember App for testing
var App = Ember.Application.create({
    autoinit: false,
    LOG_TRANSITIONS: true
});

//Basic config
var CONFIG = {
              //host: "https://blacklab.taurus.uberspace.de/ejabberd/http-bind"
                host: "http://localhost:5280/http-bind/"
             };
