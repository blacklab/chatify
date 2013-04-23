/* Namespace for XC tests. */
XC.Test = {};

XC.Test.MockConnection = XC.ConnectionAdapter.extend({
  _handlers: null,
  _data: null,
  _responses: null,

  jid: function () {
    return 'mock@example.com';
  },

  init: function () {
    this._responses = [];
    this._handlers  = {};

    return this;
  },

  addResponse: function (response) {
    this._responses.push(response);
  },

  nextResponse: function () {
    return this._responses.shift();
  },

  fireEvent: function (event) {
    var handler = this._handlers[event],
        args    = [];

    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    if (handler) {
      handler.apply(handler, args);
    }
  },

  send: function (xml, callback, args) {
    this._data = xml;
    args = args || [];
    args.unshift(this.nextResponse());
    if (callback) {
      callback.apply(callback, args);
    }
  },

  registerHandler: function (event, handler) {
    this._handlers[event] = handler;
  },

  unregisterHandler: function (event, handler) {
    delete this._handlers[event];
  },

  getLastStanzaXML: function() {
    return this._data;
  }
});
