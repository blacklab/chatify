/**
 * Original by szimek - form https://github.com/szimek/
 * This software is released under the MIT license:
 * www.opensource.org/licenses/MIT
 * 
 * Modified by Karsten Jeschkies - jeskar@web.de
 */

var IM = {};

//Ugly
function onStatus(status){
    console.log("Status: " + status);
};

// constructor
IM.Client = function (options) {
    this.host = options.host || '/http-bind';
    this.jid = options.jid;
    this.password = options.password;
    this.connection = new Strophe.Connection(this.host);
    this.jids = {};

    // TODO: move into a function
    // monitor all traffic in debug mode
    if (options.debug) {
        
        //log all status
        $.subscribe('error.client.im', onStatus);
        $.subscribe('connecting.client.im', onStatus);
        $.subscribe('connfail.client.im', onStatus);
        $.subscribe('authenticating.client.im', onStatus);
        $.subscribe('authfail.client.im', onStatus);
        $.subscribe('connected.client.im', onStatus);
        $.subscribe('diconnecting.client.im', onStatus);
        $.subscribe('diconnected.client.im', onStatus);
        $.subscribe('attached.client.im', onStatus);
        
        this.connection.xmlInput = function (xml) {
            console.log('Incoming:');
            console.log(xml);
        };
        this.connection.xmlOutput = function (xml) {
            console.log('Outgoing:');
            console.log(xml);
        };
    }
};

//------------------------------------------------------------------------------
//----- Private properties and methods ------------------------------------------
IM.Client.prototype._onConnect = function (status) {
    console.log("Status: " + status);
    
    var Status = Strophe.Status;

    switch (status) {
    case Status.ERROR:
        $.publish('error.client.im', status);
        break;
    case Status.CONNECTING:
        $.publish('connecting.client.im', status);
        break;
    case Status.CONNFAIL:
        $.publish('connfail.client.im', status);
        break;
    case Status.AUTHENTICATING:
        $.publish('authenticating.client.im', status);
        break;
    case Status.AUTHFAIL:
        $.publish('authfail.client.im', status);
        break;
    case Status.CONNECTED:
        this._onConnected();
        $.publish('connected.client.im', status);
        break;
    case Status.DISCONNECTING:
        $.publish('diconnecting.client.im', status);
        break;
    case Status.DISCONNECTED:
        $.publish('diconnected.client.im', status);
        break;
    case Status.ATTACHED:
        $.publish('attached.client.im', status);
        break;
    }

    return true;
};

IM.Client.prototype._onConnected = function () {
    // get friend list
    //this.getRoster(null, _.bind(this._onRoster, this));

    // monitor friend list changes
    //this.connection.addHandler(_.bind(this._onRosterChange, this), Strophe.NS.ROSTER, 'iq', 'set');

    // monitor friends presence changes
    //this.connection.addHandler(_.bind(this._onPresenceChange, this), null, 'presence');

    // monitor incoming chat messages
    this.connection.addHandler(_.bind(this._onMessage, this), null, 'message', 'chat');

    // notify others that we're online and request their presence status
    this.presence();
};

IM.Client.prototype._onMessage = function (stanza) {
    stanza = $(stanza);

    var fullJid = stanza.attr('from'),
        bareJid = Strophe.getBareJidFromJid(fullJid),
        body = stanza.find('body').text(),
        // TODO: fetch activity
        activity = 'active',
        message = {
            id: stanza.attr('id'),
            from: fullJid,
            body: body,
            activity: activity
        };

    // Reset addressing
    this.jids[bareJid] = fullJid;

    $.publish('message.client.im', message);
    return true;
};

//------------------------------------------------------------------------------
//----- Public properties and methods ------------------------------------------
IM.Client.prototype.connect = function () {
    this.connection.connect(this.jid, 
                            this.password, 
                            _.bind(this._onConnect, this));
    return this;
};

IM.Client.prototype.send = function (stanza) {
    this.connection.send(stanza);
};

IM.Client.prototype.presence = function (status) {
    var stanza = $pres();
    if (status) {
        stanza.attrs({type: status});
    }
    this.send(stanza);
};

IM.Client.prototype.message = function (to, message) {
    var fullJid = to,//this.jids[to],
        stanza = $msg({
            to: fullJid,
            type: 'chat'
        }).c('body').t(message);
    this.send(stanza);
};