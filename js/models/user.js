
//----- User ------------------------------------------------------------------

//Model
App.User = Ember.Object.extend({
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
