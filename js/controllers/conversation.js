
//Conversation Controller

App.ConversationsConversationController = Ember.ObjectController.extend({

    sendChat: function(message){
        //Just proxy
        this.get('content').sendChat(message);
    },

    /* Returns an array of all Spotify track URIs for this conversation
     */
    allTracks: function(){
        var tracks = Em.A();
        this.get('messages').forEach(function(msg, index, enumerable){
            console.log("Add tracks: ", msg.tracks);
            tracks.addObjects(msg.tracks);
        });

        return tracks;
    }.property('content.messages')
});

