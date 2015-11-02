/*!* @license
 * XC: XMPP Client Library
 * Copyright (c) 2010 Junction Networks
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * @namespace
 * <p>XMPP Client Library core object.</p>
 *
 * <p>XC is designed to be a RFC / XEP compliant JavaScript library that
 * provides an abstract API to perform common XMPP actions. This library
 * is not intended to ensure proper flows, and those wishing to make a
 * compliant client should read RFC 3920, RFC 3921, and any XEPs that
 * you plan on using. Again, this XMPP stack ensures proper messaging,
 * not control flow.</p>
 *
 * <p>XC is <b>NOT</b> a BOSH client, and purposely uses the adapter design
 * pattern so you may provide your own.</p>
 * @version 1.3.4
 */
var XC = {

  /**
   * The version number for XC using <a href="http://semver.org">Semantic Versioning</a>.
   * @type String
   */
  VERSION: '1.3.4',

  /**
   * Prints a debug message to the console, if window.console exists.
   * @returns {void}
   */
  debug: function () {
    return window.console && window.console.debug && window.console.debug.apply && window.console.debug.apply(window.console, arguments);
  },

  /**
   * Prints a log to the console, if window.console exists.
   * @returns {void}
   */
  log: function () {
    return window.console && window.console.log && window.console.warn.apply && window.console.log.apply(window.console, arguments);
  },

  /**
   * Prints a warning to the console, if window.console exists.
   * @returns {void}
   */
  warn: function () {
    return window.console && window.console.warn && window.console.warn.apply && window.console.warn.apply(window.console, arguments);
  },

  /**
   * Prints an error to the console, if window.console exists.
   * @returns {void}
   */
  error: function () {
    return window.console && window.console.error && window.console.error.apply && window.console.error.apply(window.console, arguments);
  },

  /**
   * Begins a console group, if it's able to; otherwise it tries to print a log.
   * @returns {void}
   */
  group: function () {
    if (window.console && window.console.group) {
      window.console.group.apply(window.console, arguments);
    } else {
      XC.log.apply(XC, arguments);
    }
  },

  /**
   * End a console group.
   * @returns {void}
   */
  groupEnd: function () {
    if (window.console && window.console.groupEnd) {
      window.console.groupEnd();
    }
  },

  /**
   * Returns whether or not the Object passed in
   * is a function.
   *
   * @param {Object} o The Object to test.
   * @returns {Boolean} True if the Object is a function, false otherwise.
   */
  isFunction: function (o) {
    return (/function/i).test(Object.prototype.toString.call(o));
  },

  /**
   * Returns whether or not the Object passed in
   * is a String.
   *
   * @param {Object} o The Object to test.
   * @returns {Boolean} True if the Object is a String, false otherwise.
   */
  isString: function (o) {
    return (/string/i).test(Object.prototype.toString.call(o));
  }
};

/**
 * @namespace
 * Namespace for services.
 */
XC.Service = {};

/**
 * @namespace
 * Namespace for mixins.
 */
XC.Mixin = {};
/**
 * @namespace
 * <p>Base object for XC. All other objects inherit from this one.
 * This provides object inheritance much like Douglas Crockford's
 * <a href="http://javascript.crockford.com/prototypal.html">Prototypal
 * Inheritance in JavaScript</a> with a few modifications of our own.</p>
 *
 * <p>This framework uses Object templates rather than classes to provide
 * inheritance.</p>
 */
XC.Base = {

  /**
   * Iterates over all arguments, adding their own properties to the
   * receiver.
   *
   * @example
   *   obj.mixin({
   *     hello: "world"
   *   });
   *   obj.hello;
   *   // -> "world"
   *
   * @returns {XC.Base} the receiver
   *
   * @see XC.Base.extend
   */
  mixin: function () {
    var len = arguments.length,
      /** @ignore */
      empty = function () {},
      obj, val, fn, cur;

    for (var i = 0; i < len; i++) {
      obj = arguments[i];
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          val = obj[prop];
          cur = this[prop];

          if (XC.isFunction(val) && val._xcInferior && cur) {
            continue;
          }

          if (XC.isFunction(val) && val._xcAround) {
            fn = (cur && XC.isFunction(cur)) ? cur : empty;
            val = val.curry(fn);
          }


          this[prop] = val;
        }
      }

      // Prevents IE from clobbering toString
      if (obj && obj.toString !== Object.prototype.toString) {
        this.toString = obj.toString;
      }
    }
    return this;
  },

  /**
   * Creates a new object which extends the current object.  Any
   * arguments are mixed in to the new object as if {@link XC.Base.mixin}
   * was called on the new object with remaining args.
   *
   * @example
   *   var obj = XC.Base.extend({
   *     hello: "world"
   *   });
   *   obj.hello;
   *   // -> "world"
   * 
   *   XC.Base.hello;
   *   // -> undefined
   * @returns {XC.Base} the new object
   *
   * @see XC.Base.mixin
   */
  extend: function () {
    var F = function () {},
        rc;
    F.prototype = this;
    rc = new F();
    rc.mixin.apply(rc, arguments);

    if (rc.init && rc.init.constructor === Function) {
      rc.init.call(rc);
    }

    return rc;
  }

};
/**
 * @name Function
 * @namespace
 * Utility library for mixing in common functionality to
 * native Javascript objects
 */

XC.Base.mixin.call(Function.prototype, /** @lends Function.prototype */ {

  /**
   * Around adds a flag to a function
   * that lets {@link XC.Base.mixin} know
   * to mixin the function curried with the
   * base function.  If no base function exits
   * the around function will be curried with a
   * dummy Function.  It is up to the client
   * to check the return value of the curried
   * function
   *
   * @example
   *   var foo = XC.Base.extend({
   *     bar: function (junk) {
   *       return 'foo' + junk;
   *     }
   *   });
   *   var fooBar = foo.extend({
   *     bar: function (foosBar, junk) {
   *       return 'foo' + foosBar.call(this, [junk]);
   *     }.around();
   *   });
   *   foo.bar('bell')
   *   // -> 'barbell'
   *   fooBar.bar('n')
   *   // -> 'foobarn'
   * @returns {Function} The reciever
   */
  around: function () {
    this._xcAround = true;
    return this;
  },

  /**
   * <p>Marks the function as inferior.
   * If a key exists on the mixin and the new mixin is marked as inferior,
   * it will ignore the new function, relying on the old function
   * for its implementation.</p>
   *
   * @example
   *   var foo = XC.Base.extend({
   *     bar: function () { return 1; }
   *   }, {
   *     bar: function () { return 2; }.inferior()
   *   });
   *   foor.bar()
   *   // -> 1
   * @returns {Function} The reciever
   */
  inferior: function () {
    this._xcInferior = true;
    return this;
  }
});

// must mix this in separately because we want to call inferior here
XC.Base.mixin.call(Function.prototype, /** @lends Function.prototype */ {
  /**
   * Appends the arguments given to the function,
   * returning a new function that will call the
   * original function with the given arguments appended
   * with the arguments supplied at runtime.
   *
   * @returns {Function} This function with pre-filled arguments.
   * @example
   *   function aggregate () {
   *     var sum = 0, idx = arguments.length;
   *     while (idx--) {
   *       sum += arguments[idx];
   *     }
   *     return sum;
   *   }
   *   aggregate(2, 5, 9);
   *   // -> 16
   *   var oneMore = aggregate.curry(1);
   *   oneMore(2, 5, 9);
   *   // -> 17
   */
  curry: function () {
    if (!arguments.length) {
      return this;
    }
    var curriedArgs = Array.from(arguments),
        fn = this;
    return function () {
      return fn.apply(this, curriedArgs.concat(Array.from(arguments)));
    };
  }.inferior(),

  /**
   * <p>Bind 'this' to be the value of target when the bound function
   * is invoked. Any additional arguments will be prepended to the argument
   * list when the function is called.</p>
   *
   * <p>This function is compatible with the ECMAScript 5 standard.</p>
   *
   * @param {Object} target The value that 'this' should represent.
   * @returns {Function} This function wrapped to take the target as 'this'.
   * @example
   *   var Person = {
   *     name: null,
   *     sayHi: function () {
   *       return "Hello, " + this.name;
   *     }
   *   };
   *   var mal = Person.extend({
   *     name: 'Mal'
   *   });
   *   var mrFancyPants = {
   *     name: 'Mr. FancyPants'
   *   });
   *   mal.sayHi();
   *   // -> 'Hello, Mal'
   *
   *   var sayWho = mal.sayHi.bind(mrFancyPants)
   *   sayWho();
   *   // -> 'Hello, Mr. FancyPants'
   */
  bind: function (target) {
    var _method = this,
        args = Array.from(arguments).slice(1);
    return function () {
      return _method.apply(target, args.concat(Array.from(arguments)));
    };
  }.inferior()
});

/**
 * Array mixins
 */
XC.Base.mixin.call(Array, /** @lends Array */ {
  /**
   * Convert an iterable object into an Array.
   *
   * @param {Object} object An object that is iterable
   * @returns {Array} The object converted into an Array.
   * @example
   *   function commaSeparate () {
   *     return Array.from(arguments).join(', ');
   *   }
   *
   *   commaSeparate("romeo", "juliet", "benvolio");
   *   // -> "romeo, juliet, benvolio"
   */
  from: function (iterable) {
    return Array.prototype.slice.apply(iterable);
  }.inferior()
});

/**
 * Internet Explorer doesn't implement indexOf,
 * so implement it here.
 */
XC.Base.mixin.call(Array.prototype, /** @lends Array.prototype */ {
  /**
   * Returns the index of an object in an Array.
   * This is here for JScript not having the indexOf function on the Array prototype.
   *
   * @param {Object} object The Object to look for.
   * @returns {Number} The index of the Object or -1 if it doesn't exist.
   */
  indexOf: function (o) {
    for (var i = 0; i < this.length; i++)  {
      if (this[i] === o) {
        return i;
      }
    }
    return -1;
  }.inferior()
});
/**
 * @class
 * Simple error class of XC.
 *
 * @param {String} message The message that the error should throw.
 * @example
 *   throw new XC.Error('the error message');
 */
XC.Error = function (message) {
  this.message = message;
};
XC.Error.prototype = new Error();
XC.Error.prototype.name = 'XC.Error';
/**
 * @namespace
 * Helper functions for XML DOM manipulation.
 *
 * <p>The IE DOM Core Level 2 is incomplete:</p>
 * <p>These functions were originally mixed into Node.prototype, however
 * IE doesn't implement the Node prototype, rather than bending over backwards
 * to make it look like it does I've accepted this instead...</p>
 * @see <a href="http://msdn.microsoft.com/en-us/library/dd282900%28VS.85%29.aspx#domproto">MSDN DOM prototypes</a>
 */
var XC_DOMHelper = {
  /**
   * An integer indicating which type of node this is.
   *
   * @see <a href="http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247">NodeType Specification</a>
   */
  NodeTypes: {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  },

  /**
   * Get the first child from a document fragment that is an Element.
   *
   * @param {Element|Node} el The document fragment to search.
   * @returns {Node|null} The node if it exists or null.
   */
  getFirstElementChild: function (el) {
    var nodeType = XC_DOMHelper.NodeTypes.ELEMENT_NODE;
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
      if (el.childNodes[i].nodeType === nodeType) {
        return el.childNodes[i];
      }
    }
    return null;
  },

  /**
   * Retrieve all immediate children that have a XML namespace (xmlns) that
   * is matching the nsURI argument.
   *
   * @param {Element|Node} el The document fragment to search.
   * @param {String} nsURI The namespace URI to search for.
   * @returns {Element[]|Array} A list of elements or an empty array.
   */
  getElementsByNS: function (el, nsURI) {
    var ret = [];
    var nodeType = XC_DOMHelper.NodeTypes.ELEMENT_NODE;
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
      if (el.childNodes[i].nodeType === nodeType &&
          el.childNodes[i].namespaceURI === nsURI) {
        ret.push(el.childNodes[i]);
      }
    }
    return ret;
  },

  /**
   * Get the text of an XML element.
   *
   * @param {Element|Node} el The document fragment to get the text of.
   * @returns {String} The inner text of the fragment.
   */
  getTextContent: function (el) {
    return el && (el.text || el.textContent);
  },

  /**
   * Set the text of an XML element.
   *
   * @param {Element|Node} el The document fragment to get the text of.
   * @param {String} text The inner text of the fragment.
   * @returns {void}
   */
  setTextContent: function (el, text) {
    if (el) {
      if ("textContent" in el) {
        el.textContent = text;
      } else {
        el.text = text;
      }
    }
  },

  /**
   * Serialize the Document / Element into a string.
   *
   * @param {Element|Node} node The document to serialize into a string.
   * @returns {String} The document fragment as a string.
   */
  serializeToString: function (node) {
    if ("XMLSerializer" in window) {
      return (new XMLSerializer()).serializeToString(node);
    } else {
      return node.xml;
    }
  },

  /**
   * Internet Explorer doesn't implement createElementNS.
   *
   * @param {String} ns The namespace of the elment to create.
   * @param {String} tagName The name of the tag to create.
   * @returns {Element} The namespaced element.
   */
  createElementNS: function (ns, tagName) {
    if ("createElementNS" in document) {
      return document.createElementNS(ns, tagName);
    } else {
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      return xmlDoc.createNode(1, tagName, ns);
    }
  }
};
/**
 * @namespace
 * Namespace for XML elements
 */
XC.XML = {};

/**
 * @class
 * A simple XML element class.
 *
 * @example
 *   var newElement = XC.XML.Element.extend({name: 'foo'});
 *   newElement.attr('bar', 'bam');
 *   newElement.addChild(XC.XML.Element.extend({name: 'child'}));
 *   newElement.toString();
 *   // -> '<foo bar="bam"><child></child></foo>'
 *
 * @extends XC.Base
 */
XC.XML.Element = XC.Base.extend(/** @lends XC.XML.Element# */{
  name: null,
  attributes: null,
  xmlns: null,
  children: null,
  text: null,

  /**
   * Get or set attributes on the receiver.
   *
   * @param {String} name The attributes name.
   * @param {String} [value] If value is supplied, the attribute will be set.
   * @returns {String} the value of the attribute.
   */
  attr: function (name, value) {
    this.attributes = this.attributes || {};
    if (value) {
      this.attributes[name] = value;
    }
    return this.attributes[name];
  },

  /**
   * Add a XML child element to the receiver.
   *
   * @param {XC.XML.Element} child The XML element to add as a child.
   * @returns {XC.XML.Element} The receiver.
   */
  addChild: function (child) {
    this.children = this.children || [];
    if (child) {
      this.children.push(child);
    }
    return this;
  },

  /**
   * @function
   * Escape XML characters to prevent parser errors.
   *
   * @param {String} string The string to escape.
   * @returns {String} The escaped string.
   */
  escapeXML: (function () {
    var character = {
      '"': '&quot;',
      "'": '&apos;',
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;'
    }, re = /[<>&"']/g;
    return function (str) {
      return str.replace(re, function (c) {
        return character[c];
      });
    };
  }()),

  /**
   * Return an XML string representation of this element.
   *
   * @returns {String} This XML element as XML text.
   */
  toString: function () {
    var ret = "";
    var attrs = [];

    if (this.xmlns) {
      this.attr('xmlns', this.xmlns);
    }

    if (this.attributes) {
      for (var name in this.attributes) {
        var val = this.attributes[name];
        if (!val) {
          continue;
        }

        attrs.push(name + '="' + this.escapeXML(val.toString()) + '"');
      }
    }

    ret += "<" + this.name;
    ret += (attrs.length > 0) ? ' ' + attrs.join(' ') : '';
    ret += ">";

    var children = this.children || [];
    for (var i = 0, len = children.length; i < len; i++) {
      ret += this.children[i].toString();
    }

    if (this.text) {
      ret += this.escapeXML(this.text.toString());
    }

    ret += "</" + this.name + ">";

    return ret;
  }
}, /** @lends XC.XML.Element */ {

  /**
   * Convenience function for creating a new XC.XML.Element and
   * setting attrs and elements in a single function
   *
   * @param {Object} [attrs] A hash of attribute names to attribute values.
   * @param {XC.XML.Element[]} [elements] An array of XC.XML.Element to assign as children.
   * @returns {XC.XML.Element}
   */
  create: function (attrs, elements) {
    var ret = this.extend();

    if (attrs) {
      for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          var v = attrs[k];
          if (!v) {
            continue;
          }
          ret.attr(k, v);
        }
      }
    }

    elements = (elements && elements.addChild) ? [elements] : elements;
    if (elements && elements.length) {
      for (var i = 0, len = elements.length; i < len; i++) {
        ret.addChild(elements[i]);
      }
    }

    return ret;
  },

  /**
   * Returns the XML given the JSON object.
   *
   * <code>xmlize</code> uses a custom format for
   * defining XML in a 1:1 manner.
   *
   * Any given element will be an object literal.
   * <ul>
   *   <li>The tag name of the element is scoped under <code>name</code>.</li>
   *   <li>The attributes of the element are scoped under <code>attrs</code>.</li>
   *   <li>The children of the element are scoped under <code>children</code>.</li>
   *   <li>The namespace of the element is scoped under <code>xmlns</code>.</li>
   *   <li>The text of the element is scoped under <code>text</code>.</li>
   * </ul>
   *
   * @param {Object} xml The XML in JSON notation.
   * @param {XC.XML.Element} stanza The root XML element to put the JSON XML in.
   * @returns XC.XML.Element The stanza passed in mutated by the XML.
   * @example
   *  XC.XML.Element.xmlize({
   *    attrs: {
   *      type: 'chat',
   *      to: 'mickey.moose@muppets.com'
   *    },
   *    children: [{
   *      name: 'subject',
   *      text: 'Chocolate Moose'
   *    }, {
   *      name: 'body',
   *      text: 'Yum yum yum for the chocolate.'
   *    }]
   *  }, XC.XML.XMPP.Message.extend());
   *
   *  // => <message type="chat" to="mickey.moose@muppets.com">
   *  //      <subject>Chocolate Moose</subject>
   *  //      <body>Yum yum yum for the chocolate.</body>
   *  //    </message>
   */
  xmlize: function (json, stanza, ignore) {
    var children = json.children, child,
        el, i, len;

    stanza.attributes = stanza.attributes || {};
    XC.Base.mixin.apply(stanza.attributes, [json.attrs]);
    stanza.text = json.text;
    stanza.name = json.name || stanza.name;
    stanza.xmlns = json.xmlns || stanza.xmlns;

    len = children ? children.length : 0;
    for (i = 0; i < len; i++) {
      child = children[i];
      el = XC.XML.Element.extend({ name: child.name });
      if (this.xmlize(child, el)) {
        stanza.addChild(el);
      }
    }

    return stanza;
  }
});

/**
 * @namespace
 * Namespace for XMPP XML elements.
 */
XC.XML.XMPP = {};

/**
 * @class
 * Generic XMPP stanza.
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.Stanza = XC.XML.Element.extend(/** @lends XC.XML.XMPP.Stanza# */{

  xmlns: 'jabber:client',

  to: function (val) {
    return this.attr('to', val);
  },

  from: function (val) {
    return this.attr('from', val);
  },

  type: function (val) {
    return this.attr('type', val);
  },

  id: function (val) {
    return this.attr('id', val);
  }
});

/**
 * @class
 * XMPP IQ (Info Query) stanza.
 *
 * @extends XC.XML.XMPP.Stanza
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.IQ = XC.XML.XMPP.Stanza.extend(/** @lends XC.XML.XMPP.IQ# */{
  name: 'iq'
});

/**
 * @class
 * XMPP PubSub Element
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/extensions/xep-0060.html#schemas-pubsub">XEP-0060: Publish Subscribe</a>
 */
XC.XML.XMPP.PubSub = XC.XML.Element.extend(/** @lends XC.XML.XMPP.PubSub# */{
  name: 'pubsub',
  xmlns: 'http://jabber.org/protocol/pubsub'
});

/**
 * @class
 * XMPP Message stanza.
 *
 * @extends XC.XML.XMPP.Stanza
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.Message = XC.XML.XMPP.Stanza.extend(/** @lends XC.XML.XMPP.Message# */{
  name: 'message'
});

/**
 * @class
 * XMPP Presence stanza.
 *
 * @extends XC.XML.XMPP.Stanza
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.Presence = XC.XML.XMPP.Stanza.extend(/** @lends XC.XML.XMPP.Presence# */{
  name: 'presence'
});

/**
 * @class
 * XMPP Query stanza.
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.Query = XC.XML.Element.extend(/** @lends XMPP.Query# */{
  name: 'query'
});

/**
 * @class
 * XMPP Error stanza.
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#stanzas">XMPP Core: Stanzas</a>
 */
XC.XML.XMPP.Error = XC.XML.Element.extend(/** @lends XMPP.Error# */{
  name: 'error'
});

/**
 * @class
 * XMPP AdHoc Command element.
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/extensions/xep-0050.html">XEP-0050 Ad-Hoc Commands</a>
 */
XC.XML.XMPP.Command = XC.XML.Element.extend(/** @lends XC.XML.XMPP.Command# */{
  name: 'command',
  xmlns: 'http://jabber.org/protocol/commands',

  node: function (val) {
    return this.attr('node', val);
  },

  action: function (val) {
    return this.attr('action', val);
  }
});

/**
 * @class
 * XMPP XDataForm element.
 *
 * @extends XC.XML.Element
 * @see <a href="http://xmpp.org/extensions/xep-0004.html">XEP-0004 Data Forms</a>
 */
XC.XML.XMPP.XDataForm = XC.XML.Element.extend(/** @lends XC.XML.XMPP.XDataForm# */{
  name: 'x',
  xmlns: 'jabber:x:data',

  type: function (val) {
    return this.attr('type', val);
  },

  /**
   * A convenience method for adding fields and values to the
   * XDataForm. Calling this method will add an XDataField and value to
   * this XDataForm.
   *
   * @param {String} name The name of the field, as identified in the 'var' attribute.
   * @param {String} value The text to insert into the 'value' element.
   * @param {String} type XDataField type see XEP: 0004.
   * @returns {XC.XML.XMPP.XDataForm} The receiver.
   */
  addField: function (name, value, type) {
    var f, v;
    f = XC.XML.Element.extend({name: 'field'});
    f.attr('var', name);

    if (value) {
      v = XC.XML.Element.extend({name: 'value', text: value});
      f.addChild(v);
    }

    if (type) {
      f.attr('type', type);
    }

    return this.addChild(f);
  }
});
/**
 * @namespace
 * The XMPP Registry.
 * The <a href="http://xmpp.org/registrar/">XMPP Registrar</a>
 * maintains registries of protocol namespaces and various parameters.
 */
XC.Registrar = {};

/**
 * @namespace
 * Roster Management constants.
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 7 & 8</a>
 */
XC.Registrar.Roster = {
  /**
   * The XML namespace for Roster IQs
   * @type String
   * @constant
   */
  XMLNS: 'jabber:iq:roster'
};

/**
 * @namespace
 * Service Discovery namespace information.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0030.html">XEP-0030: Service Discovery</a>
 */
XC.Registrar.Disco = {
  /**
   * The XML namespace for Disco queries.
   * @type String
   * @constant
   */
  XMLNS: 'http://jabber.org/protocol/disco'
};

/**
 * @namespace
 * Presence constants.
 *
 * @see <a href="http://www.ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 5 & 6</a>
 */
XC.Registrar.Presence = {
  /**
   * @namespace
   * Acceptable values for the values inside
   * a &lt;show/&gt; element.
   */
  SHOW: {
    /** The entity or resource is temporarily away. */
    AWAY: 'away',
    /** The entity or resource is actively interested in chatting. */
    CHAT: 'chat',
    /** The entity or resource is is busy (dnd = "Do Not Disturb"). */
    DND:  'dnd',
    /**
     * The entity or resource is away for an extended period
     * (xa = "eXtended Away").
     */
    XA:   'xa'
  }
};

/**
 * @namespace
 * Chat State Notifications namespace information and valid states.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Registrar.ChatStateNotification = {
  /**
   * The XML namespace for Chat State Notifications.
   * @type String
   * @constant
   */
  XMLNS: 'http://jabber.org/protocol/chatstates',

  /**
   * @namespace
   * Valid states for a conversation flow.
   */
  STATES: {
    /** The user is active and ready to chat; this is entry state. */
    ACTIVE:    'active',
    /** The user is composing a message */
    COMPOSING: 'composing',
    /** The user has paused composing a message */
    PAUSED:    'paused',
    /** The user is inactive */
    INACTIVE:  'inactive',
    /** The user has left the chat */
    GONE:      'gone'
  }
};

/**
 * @namespace
 * Roster Item Exchange namespace information constants.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0144.html">XEP-0144: Roster Item Exchange</a>
 */
XC.Registrar.RosterX = {

  /**
   * The Roster Item Exchange namespace
   * @type String
   * @constant
   */
  XMLNS: 'http://jabber.org/protocol/rosterx',

  /**
   * @namespace
   * Possible actions requested on a node.
   */
  ACTION: {
    /** Add the entity to your roster */
    ADD:    'add',
    /** Modify the entity on your roster */
    MODIFY: 'modify',
    /** Remove the entity from your roster */
    DELETE: 'delete'
  }
};

/**
 * @namespace
 * vcard-temp namespace information constants.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0054.html">XEP-0054: vcard-temp</a>
 */
XC.Registrar.VCard = {
  /**
   * The vCard namespace
   * @type String
   * @constant
   */
  XMLNS: 'vcard-temp'
};

/**
 * @namespace
 * Delayed Delivery namespace.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0203.html">XEP-0203: Delayed Delivery</a>
 */
XC.Registrar.DelayedDelivery = {
  /**
   * The delayed delivery namespace
   * @type String
   * @constant
   */
  XMLNS: 'urn:xmpp:delay'
};

/**
 * @namespace
 * Private XML Storage namespace.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0049.html">XEP-0049: Private XML Storage</a>
 */
XC.Registrar.PrivateStorage = {
  /**
   * The private storage namespace
   * @type String
   * @constant
   */
  XMLNS: 'jabber:iq:private'
};
/**
 * @class
 * This documents how incoming XML stanzas should be wrapped
 * to be ingested by XC properly. This is a stub, and creates a
 * specification for you (the developer) to interface with XC.
 *
 * @name XC.PacketAdapter
 */

/**
 * Get the JID that the stanza was sent from.
 * @name XC.PacketAdapter#getFrom
 * @function
 * @returns {String} The JID of the sender.
 */

/**
 * Get the JID that the stanza was sent to.
 * @name XC.PacketAdapter#getTo
 * @function
 * @returns {String} The target JID (should be the same as the connection.)
 */

/**
 * Get the type of the packet (the type attribute in the XML schema).
 * @name XC.PacketAdapter#getType
 * @function
 * @returns {String} The type of the stanza.
 */

/**
 * Get the root node of the XML stanza.
 * @name XC.PacketAdapter#getNode
 * @function
 * @returns {Element} The root element of the XML stanza.
 */
/**
 * @class
 * Mixin for discoverable services.
 * This provides a registration mechanism for
 * features, items, and identities for Service Discovery.
 *
 * @requires XC.Connection
 * @see XC.Service.Disco
 */
XC.Mixin.Discoverable = /** @lends XC.Mixin.Discoverable# */{

  /**
   * @private
   */
  init: function ($super) {
    // init the root node
    if (this.connection && !this._rootNode) {
      if (!this.connection._discoverableRootNode) {
        this.connection._discoverableRootNode = XC.Mixin.Discoverable._createNode();
        this.connection._discoverableRootNode.nodes = {};
      }
      this._rootNode = this.connection._discoverableRootNode;
    }

    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));
    }
  }.around(),

  /**
   * @private
   * The root of the Disco tree.
   *
   * @type XC.DiscoItem
   */
  _rootNode: null,

  /**
   * @private
   */
  _createNode: function () {
    return {
      identities: [],
      features: [],
      items: []
    };
  },

  /**
   * @private
   * Fetch a node. If it exists, retrieve it; otherwise do lazy instantiation.
   * @param {String} [node] The name of the node to fetch.
   */
  _fetchNode: function (node) {
    if (node && !this._rootNode.nodes[node]) {
      this._rootNode.nodes[node] = XC.Mixin.Discoverable._createNode();
    }
    return node ? this._rootNode.nodes[node] : this._rootNode;
  },

  /**
   * Retrieve features on a given node. Defaults to the root node.
   * @param {String} [node] The name of the node to fetch.
   * @returns {String[]} The features on the node.
   */
  getFeatures: function (nodeName) {
    return this._fetchNode(nodeName).features;
  },

  /**
   * Retrieve identities on a given node. Defaults to the root node.
   * @param {String} [node] The name of the node to fetch.
   * @returns {Object[]} The identities on the node.
   */
  getIdentities: function (nodeName) {
    return this._fetchNode(nodeName).identities;
  },

  /**
   * Retrieve items on a given node. Defaults to the root node.
   * @param {String} [node] The name of the node to fetch.
   * @returns {Object[]} The items on the node.
   */
  getItems: function (nodeName) {
    return this._fetchNode(nodeName).items;
  },

  /**
   * Add a feature to the Disco tree.
   *
   * @param {String} xmlns   The namespace of the feature to add.
   * @param {String} [node]  The name of the node to add the feature to.
   *
   * @returns {XC.Discoverable} The calling object.
   */
  addFeature: function (xmlns, nodeName) {
    var node = this._fetchNode(nodeName);
    if (node.features.indexOf(xmlns) === -1) {
      node.features.push(xmlns);
    }
    return this;
  },

  /**
   * Remove a pre-existing feature from this item.
   *
   * @param {String} xmlns The namespace of the feature to remove.
   * @param {String} [node] The name of the node to add the feature to.
   *
   * @returns {Boolean} True if it was removed; false if it doesn't exist.
   */
  removeFeature: function (xmlns, node) {
    var idx,
        features = this.getFeatures(node);

    idx = features.indexOf(xmlns);

    if (idx !== -1) {
      var rest = features.slice(idx + 1);
      features.length = idx;
      features.push.apply(features, rest);
      return true;
    }
    return false;
  },

  /**
   * Add a child item to this item.
   *
   * @param {Object} discoItem The item to add.
   * @param {String} discoItem.jid The JID associated with the item.
   * @param {String} [discoItem.node] The node where the item exists.
   * @param {String} [discoItem.name] The name of the item.
   * @param {String} [node] The name of the node to add the item to.
   *
   * @returns {XC.Discoverable} The calling object.
   */
  addItem: function (discoItem, node) {
    this._fetchNode(node).items.push(discoItem);
    return this;
  },

  /**
   * Remove a pre-existing item from this item.
   *
   * @param {Object} discoItem The item to remove.
   * @param {String} [node] The name of the node to remove the item from.
   *
   * @returns {Boolean} True if it was removed; false if it doesn't exist.
   */
  removeItem: function (item, node) {
    var idx, items = this.getItems(node);

    idx = items.indexOf(item);
    if (idx !== -1) {
      var rest = items.slice(idx + 1);
      items.length = idx;
      items.push.apply(items, rest);
      return true;
    }
    return false;
  },

  /**
   * Add an identity to this item.
   *
   * @param {Object} identity The identity to add.
   * @param {String} identity.category The category of the identity.
   * @param {String} identity.type The type of the identity.
   * @param {String} [identity.name] The name of the identity.
   * @param {String} [node] The name of the node to add the identity to.
   *
   * @returns {XC.Discoverable} The calling object.
   */
  addIdentity: function (identity, node) {
    this._fetchNode(node).identities.push(identity);
    return this;
  },

  /**
   * Remove a pre-existing identity from this item.
   *
   * @param {Object} identity The identity to remove.
   * @param {String} [node]   The name of the node to remove the identity from.
   *
   * @returns {Boolean} True if it was removed; false if it doesn't exist.
   */
  removeIdentity: function (identity, node) {
    var idx, identities = this.getIdentities(node);

    idx = identities.indexOf(identity);
    if (idx !== -1) {
      var rest = identities.slice(idx + 1);
      identities.length = idx;
      identities.push.apply(identities, rest);
      return true;
    }
    return false;
  }
};
/**
 * @class
 * Mixin to provide callback handler registration to
 * the services that mix it in.
 */
XC.Mixin.HandlerRegistration = /** @lends XC.Mixin.HandlerRegistration# */{

  /**
   * @private
   */
  init: function ($super) {
    var tmp = {};
    if (this._registeredHandlers) {
      tmp = XC.Base.extend(this._registeredHandlers);
    }

    this._registeredHandlers = tmp;

    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));
    }
  }.around(),

  /**
   * Register a callback handler for a named event.
   * it is the responsibility of the caller of this function
   * to either properly bind callbacks or provide a target
   * scope to apply to the callback.
   *
   * @param {String} event Event name
   * @param {Function} callback Function to fire as the callback
   * @param {Object} [target] Object to which 'this' will be bound
   *
   * @returns {Boolean} True indicates success
   */
  registerHandler: function (event, callback, target) {
    if (!XC.isFunction(callback)) {
      return false;
    }

    this._registeredHandlers[event] = {
      action: callback,
      target: target || this
    };

    return true;
  },

  /**
   * Fire all handlers associated with an evet.
   * @private
   * @param {String} event The event to trigger.
   * @param {...} args A variable length arg list provided to the handlers.
   * @returns {void}
   */
  fireHandler: function (event) {
    if (this._registeredHandlers[event]) {
      var action = this._registeredHandlers[event].action,
          target = this._registeredHandlers[event].target;
      action.apply(target, Array.from(arguments).slice(1));
    }
  }
};
/**
 * @namespace
 * Roster Item Exchange mixin namespace.
 */
XC.Mixin.RosterX = {};

/**
 * @class
 * Roster Item Exchange from third party rosters.
 *
 * @extends XC.Base
 * @extends XC.Mixin.Discoverable
 * @see <a href="http://xmpp.org/extensions/xep-0144.html">Roster Item Exchange</a>
 */
XC.Mixin.RosterX.Service = XC.Base.extend(XC.Mixin.Discoverable,
  /** @lends XC.Mixin.RosterX.Service# */{

  /** @private */
  init: function ($super) {
    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));      
    }

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'iq',
        xmlns: XC.Registrar.RosterX.XMLNS
      }, this._handleRosterItemExchange, this);

      this.connection.registerStanzaHandler({
        element: 'message',
        xmlns: XC.Registrar.RosterX.XMLNS
      }, this._handleRosterItemExchange, this);

      this.addFeature(XC.Registrar.RosterX.XMLNS);
    }
  }.around(),

  /**
   * @name XC.Mixin.RosterX.Service#onRosterExchangeItems
   * @event
   * @param {XC.RosterX.Entity[]} entities A list of entities sent by a roster exchange.
   * @param {String} from The JID that the roster item exchange request was sent from.
   * @param {String} [reason] The accompanying body if
   *   the roster item exchange's parent element was a &lt;message/&gt;
   */

  /**
   * @private
   * Handle a Roster Item Exchange from a third party.
   *
   * @param {XC.PacketAdapter} packet The packet causing the handler to fire.
   */
  _handleRosterItemExchange: function (packet) {
    var node = packet.getNode(),
        entities = [],
        body = XC_DOMHelper.getTextContent(
                 node.getElementsByTagName('body')[0]
               ) || '',
        items = node.getElementsByTagName('item'),
        from = node.getAttribute('from'),
        i = 0, len = items.length;

    for (i; i < len; i++) {
      entities.push(this._rosterxEntityFromItem(items[i]));
    }
    this.fireHandler('onRosterExchangeItems', entities, from, body);
  },

  /**
   * @private
   * Construct a {@link XC.RosterX.Entity} from a XML fragment
   * from a Roster Item Exchange.
   *
   * @param {Element} item A node that contains info about a roster item.
   */
  _rosterxEntityFromItem: function (item) {
    var entity = this.connection.Entity.extend(XC.Mixin.RosterX.Entity, {
      jid: item.getAttribute('jid'),
      rosterx: {
        action: item.getAttribute('action'),
        name: item.getAttribute('name'),
        groups: []
      }
    });

    var groups = item.getElementsByTagName('group');
    for (var j = 0, len = groups.length; j < len; j++) {
      entity.rosterx.groups.push(XC_DOMHelper.getTextContent(groups[j]));
    }
    return entity;
  }

});

/**
 * @class
 * @see <a href="http://xmpp.org/extensions/xep-0144.html">Roster Item Exchange</a>
 */
XC.Mixin.RosterX.Entity = /** @lends XC.Mixin.RosterX.Entity# */{

  /**
   * @namespace
   * The Roster Item Exchange slot
   */
  rosterx: {
    /**
     * The suggested action on the Roster Exchange Item
     * @type String
     */
    action: null,

    /**
     * The Entity's suggested name.
     * @type String
     */
    name: null,

    /**
     * The Entity's suggested groups.
     * @type String[]
     */
    groups: null
  },

  /**
   * Accept the Roster Item Exchange suggestion,
   * and commit the changes to your roster.
   * @param {Object} [callbacks] An object with 'onSuccess' and 'onError' slots.
   *   @param {Function} [callbacks.onError]
   *      A function that will process roster errors.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet]
   *        The packet that produced the error.
   *   @param {Function} [callbacks.onSuccess]
   *      A function that will be called on a successful roster request.
   *     @param {XC.Entity} [callbacks.onSuccess#entity]
   *        The entity that the roster request was called on.
   * @returns {void}
   */
  acceptRosterX: function (callbacks) {
    switch (this.rosterx.action) {
    case 'add':
    case 'modify':
      this.roster = {
        name: this.rosterx.name,
        groups: this.rosterx.groups
      };
      this.setRosterItem(callbacks);
      break;
    case 'delete':
      this.removeRosterItem(callbacks);
      break;
    }
  }
};

/**
 * @namespace
 * The Roster Item Exchange namespace.
 * @name XC.RosterX
 */

/**
 * @name XC.RosterX.Entity
 * @class
 *
 * This type of {@link XC.Entity} is only created when coming from
 * the {@link XC.Mixin.RosterX.Service#onRosterExchangeItems} callback.
 *
 * @extends XC.Entity
 * @extends XC.Mixin.RosterX.Entity
 * @see <a href="http://xmpp.org/extensions/xep-0144.html">Roster Item Exchange</a>
 */
/**
 * @class
 * JID Manipulation
 * @extends XC.Base
 *
 * @see <a href="http://xmpp.org/rfcs/rfc3920.html#addressing">RFC 3920: XMPP Core; Addressing</a>
 */
XC.Mixin.JID = XC.Base.extend(/** @lends XC.Mixin.JID# */{

  /**
   * The bare JID of the entity.
   * @returns {String} The bare JID of the entity.
   * @example
   *   var mal = this.xc.Entity.extend({
   *     jid: 'mal@serenity.com/persephone'
   *   });
   *   mal.getBareJID();
   *   // -> 'mal@serenity.com'
   */
  getBareJID: function () {
    var ret = "";
    ret += (this.getJIDParts().node) ? this.getJIDParts().node + "@" : "";
    ret += this.getJIDParts().domain;
    return ret;
  },

  /**
   * The username of the JID.
   * @returns {String} The JID node (commonly used as a username).
   * @example
   *   var mal = this.xc.Entity.extend({
   *     jid: 'mal@serenity.com/persephone'
   *   });
   *   mal.getJIDNode();
   *   // -> 'mal'
   */
  getJIDNode: function () {
    return this.getJIDParts().node;
  },

  /**
   * The domain of the JID.
   * @returns {String} The JID's domain.
   * @example
   *   var mal = this.xc.Entity.extend({
   *     jid: 'mal@serenity.com/persephone'
   *   });
   *   mal.getJIDDomain();
   *   // -> 'serenity.com'
   */
  getJIDDomain: function () {
    return this.getJIDParts().domain;
  },

  /**
   * The resource of the JID.
   * @returns {String} The resource of the JID.
   * @example
   *   var mal = this.xc.Entity.extend({
   *     jid: 'mal@serenity.com/persephone'
   *   });
   *   mal.getJIDResource();
   *   // -> 'persephone'
   */
  getJIDResource: function () {
    return this.getJIDParts().resource;
  },

  /**
   * Returns the parts of the JID.
   * @returns {String} The parts of the JID.
   * @example
   *   var mal = this.xc.Entity.extend({
   *     jid: 'mal@serenity.com/persephone'
   *   });
   *   mal.getJIDParts();
   *   // -> {
   *   // node: 'mal',
   *   // domain: 'serenity.com',
   *   // resource: 'persephone'
   *   // }
   */
  getJIDParts: function () {
    if (this.jid && this.jid._cachedJIDParts) {
      return this.jid._cachedJIDParts;
    }

    var parts = this.jid.match(/^([^@\/]*(?=@)|)[@]?([^\/]*)[\/]?(.*)?$/),
      ret = {
        node: parts[1] || null,
        domain: parts[2] || null,
        resource: parts[3] || null
      };

    this.jid._cachedJIDParts = ret;
    return ret;
  }
});
/**
 * @namespace
 * Roster Management
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 7 & 8</a>
 */
XC.Mixin.Roster = /** @lends XC.Mixin.Roster# */{

  /**
   * @namespace
   * A slot to contain roster information.
   * @type Object
   */
  roster: {
    /**
     * The optional name of the entity.
     * @type String
     */
    name: null,

    /**
     * The groups the entity is a part of.
     * @type String[]
     */
    groups: null,

    /**
     * What the user is requesting
     * 'subscribe'
     * @type String
     */
    ask: null,

    /**
     * The subscription type of the entity
     * 'none', 'to', 'from', or 'both'
     * @type String
     */
    subscription: null
  },

  /**
   * Update an entity in your roster.
   *
   * @param {Object} [callbacks]
   *    An Object with methods 'onError' and 'onSuccess'.
   *   @param {Function} [callbacks.onError]
   *      A function that will process roster errors.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet]
   *        The packet that produced the error.
   *   @param {Function} [callbacks.onSuccess]
   *      A function that will be called on a successful roster set.
   *     @param {XC.Entity} [callbacks.onSuccess#entity]
   *        The entity that the roster set was called on.
   * @returns {void}
   */
  setRosterItem: function (callbacks) {
    var entity = this,
        iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Roster.XMLNS}),
        item = XC.XML.Element.extend({name: 'item'}),
        Group = XC.XML.Element.extend({name: 'group'}),
        len = (entity.roster && entity.roster.groups) ?
               entity.roster.groups.length : 0,
        group;
    iq.type('set');
    item.attr('jid', entity.getBareJID());

    if (entity.roster.name) {
      item.attr('name', entity.roster.name);
    }

    for (var i = 0; i < len; i++) {
      group = Group.extend();
      group.text = entity.roster && entity.roster.groups[i];
      item.addChild(group);
    }

    q.addChild(item);
    iq.addChild(q);
    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
                 XC.isFunction(callbacks.onSuccess)) {
        callbacks.onSuccess(entity);
      }
    });
  },

  /**
   * Remove an entity from your roster.
   *
   * @param {Object} [callbacks]
   *    An Object with methods 'onError' and 'onSuccess'.
   *   @param {Function} [callbacks.onError]
   *      A function that will process roster errors.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet]
   *        The packet that produced the error.
   *   @param {Function} [callbacks.onSuccess]
   *      A function that will be called on a successful roster remove.
   *     @param {XC.Entity} [callbacks.onSuccess#entity]
   *        The entity that the roster remove was called on.
   * @returns {void}
   */
  removeRosterItem: function (callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Roster.XMLNS}),
        item = XC.XML.Element.extend({name: 'item'}),
        entity = this;

    iq.from(this.connection.getJID());
    iq.attr('type', 'set');
    item.attr('jid', entity.getBareJID());
    item.attr('subscription', 'remove');

    q.addChild(item);
    iq.addChild(q);
    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
                 XC.isFunction(callbacks.onSuccess)) {
        callbacks.onSuccess(entity);
      }
    });
  }

};
/**
 * @class
 * One-to-one Chatting
 * @extends XC.Base
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 4</a>
 */
XC.Mixin.Chat = XC.Base.extend(/** @lends XC.Mixin.Chat# */{

  /**
   * Send a chat message to another entity.
   *
   * @param {String} [body]      The body of the message.
   * @param {String} [subject]   The subject of the message.
   * @param {String} [thread]    The thread of the message.
   * @param {String} [id]        The id of the message.
   * @returns {void}
   */
  sendChat: function (body, subject, thread, id) {
    this.connection.MessageStanza.extend({
      type: 'chat',
      body: body,
      subject: subject,
      thread: thread,
      to: this,
      id: id
    }).send();
  }

});
/**
 * @class
 * Presence Mixin.
 * 
 * @see <a href="http://www.ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 5 & 6</a>
 */
XC.Mixin.Presence = /** @lends XC.Mixin.Presence# */{

  /**
   * @namespace
   * A slot to contain presence information.
   * @type Object
   */
  presence: {
    /**
     * What the status of the entity is.
     * @type XC.Registrar.Presence.SHOW
     */
    show: null,

    /**
     * The custom status of the entity.
     * @type String
     */
    status: null,

    /**
     * A number between -128 and +127
     * @type Number
     */
    priority: null,

    /**
     * Whether or not the user is available.
     * @type Boolean
     */
    available: null
  },

  // In band

  /**
   * Send presence to all subscribed entities / resources
   * or send direced presence to a specific entity.
   * 
   * @param {String} [show] 'away', 'chat', 'dnd', or 'xa'
   *                         as defined in XC.Registrar.Presence.SHOW
   * @param {String} [status] The custom status message to send.
   * @param {Number} [priority] An integer between -127 and +128
   *                            giving the priority of the presence.
   * @returns {void}
   */
  sendDirectedPresence: function (show, status, priority) {
    var p = XC.PresenceStanza.extend({
      show: show,
      status: status,
      priority: priority,
      to: this
    });

    this.connection.send(p.toStanzaXML().toString());
  },

  /**
   * Request a subscription to an entity's presence.
   * @returns {void}
   */
  sendPresenceSubscribe: function () {
    var p = XC.XML.XMPP.Presence.extend();
    p.attr('type', 'subscribe');
    p.to(this.jid);

    this.connection.send(p.toString());
  },

  /**
   * Unsubscribe from an entity's presence.
   * @returns {void}
   */
  sendPresenceUnsubscribe: function () {
    var p = XC.XML.XMPP.Presence.extend();
    p.attr('type', 'unsubscribe');
    p.to(this.jid);

    this.connection.send(p.toString());
  },

  /**
   * Cancel a Presence subscription.
   * @returns {void}
   */
  cancelPresenceSubscription: function () {
    var p = XC.XML.XMPP.Presence.extend();
    p.attr('type', 'unsubscribed');
    p.to(this.jid);

    this.connection.send(p.toString());
  }

};
/**
 * @class
 * Service Discovery provides the ability to discover information about entities.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0030.html">XEP-0030: Service Discovery</a>
 */
XC.Mixin.Disco = /** @lends XC.Mixin.Disco# */{

  /**
   * @private
   * The root node of the Disco 'tree' that contains
   * all of the information queried.
   * 
   * @type Object
   */
  _rootNode: null,

  /**
   * @private
   * Creates nodes through lazy instantiation.
   *
   * @param {String} [node] The node to create
   * @returns {Object} The node that was asked to be created.
   */
  _createNode: function (node) {
    if (!this._rootNode) {
      this._rootNode = {
        identities: [],
        features: [],
        items: [],
        nodes: {}
      };
    }

    if (node && !this._rootNode.nodes[node]) {
      this._rootNode.nodes[node] = {
        identities: [],
        features: [],
        items: []
      };
    }

    return node ? this._rootNode.nodes[node] : this._rootNode;
  },

  /**
   * Returns a list of features on a given node,
   * or the features on the root node.
   * 
   * @param {String} [nodeName] The name of the node to query for features on.
   * @returns {String[]} A list of features on the node.
   */
  getDiscoFeatures: function (nodeName) {
    var node = this._rootNode && nodeName ? this._rootNode.nodes[nodeName] : this._rootNode;
    if (node && node.features) {
      return node.features;
    }
    return null;
  },

  /**
   * Returns a list of identities on a given node,
   * or the identities on the root node.
   * 
   * @param {String} [nodeName] The name of the node to query for identites on.
   * @returns {Object[]} A list of identites on the node.
   *                     Each item has a slot 'category' and 'type' and
   *                     an optional 'name' slot.
   */
  getDiscoIdentities: function (nodeName) {
    var node = this._rootNode && nodeName ? this._rootNode.nodes[nodeName] : this._rootNode;
    if (node && node.identities) {
      return node.identities;
    }
    return null;
  },

  /**
   * Returns a list of  items on a given node,
   * or the items on the root node.
   * 
   * @param {String} [nodeName] The name of the node to query for items on.
   * @returns {Object[]} A list of items on the node.
   *                     Each item has a slot 'jid', and may have
   *                     the optional slots 'node' or 'name' filled.
   */
  getDiscoItems: function (nodeName) {
    var node = this._rootNode && nodeName ? this._rootNode.nodes[nodeName] : this._rootNode;
    if (node && node.items) {
      return node.items;
    }
    return null;
  },

  /**
   * Discover information about an entity.
   *
   * @param {String} [nodeName] The node to query for info on the entity.
   * @param {Object} [callbacks]
   *    An Object with methods 'onError' and 'onSuccess'.
   *   @param {Function} [callbacks.onError]
   *      A function that will process disco#info errors.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet]
   *        The packet that produced the error.
   *   @param {Function} [callbacks.onSuccess]
   *      A function that will be called on a successful disco#info.
   *     @param {XC.Entity} [callbacks.onSuccess#entity]
   *        The entity with slots filled about the queried disco information.
   * @returns {void}
   */
  requestDiscoInfo: function (nodeName, callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Disco.XMLNS + '#info'}),
        entity = this;

    if (arguments.length === 1) {
      callbacks = nodeName;
      nodeName = null;
    }

    iq.type('get');
    iq.to(entity.jid);
    iq.addChild(q);

    if (nodeName) {
      q.attr('node', nodeName);
    }

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else {
        packet = packet.getNode();
        var identities = packet.getElementsByTagName('identity'),
            features = packet.getElementsByTagName('feature'),
            node = packet.getElementsByTagName('query')[0].getAttribute('node'),
            len, i, identity;

        node = entity._createNode(node);

        node.features = [];
        len = features ? features.length : 0;
        for (i = 0; i < len; i++) {
          node.features.push(features[i].getAttribute('var'));
        }

        node.identities = [];
        len = identities ? identities.length : 0;
        for (i = 0; i < len; i++) {
          identity = identities[i];
          node.identities.push({
            category: identity.getAttribute('category'),
            type: identity.getAttribute('type'),
            name: identity.getAttribute('name')
          });
        }
        if (callbacks && callbacks.onSuccess &&
            XC.isFunction(callbacks.onSuccess)) {
          callbacks.onSuccess(entity);
        }
      }
    });
  },

  /**
   * Discover the items on an entity.
   *
   * @param {Object}  [nodeName]  The node to query for i on the entity.
   * @param {Object}  [callbacks] An Object with methods 'onError' and 'onSuccess'.
   *   @param {Function} [callbacks.onError] A function that will process disco#items errors.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet] The packet that produced the error.
   *   @param {Function} [callbacks.onSuccess] A function that will be called on a successful disco#items.
   *     @param {XC.Entity} [callbacks.onSuccess#entity] The entity with slots filled about the queried disco items.
   * @returns {void}
   */
  requestDiscoItems: function (node, callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Disco.XMLNS + '#items'}),
        entity = this;

    if (arguments.length === 1) {
      callbacks = node;
      node = null;
    }

    iq.type('get');
    iq.to(entity.jid);
    iq.addChild(q);

    if (node) {
      q.attr('node', node);
    }

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError && XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else {
        packet = packet.getNode();
        var items = packet.getElementsByTagName('item'),
            node = packet.getElementsByTagName('query')[0].getAttribute('node'),
            len = items ? items.length : 0;

        node = entity._createNode(node);

        node.items = [];
        for (var i = 0; i < len; i++) {
          node.items.push({
            jid: items[i].getAttribute('jid'),
            node: items[i].getAttribute('node'),
            name: items[i].getAttribute('name')
          });
        }
        if (callbacks && callbacks.onSuccess && XC.isFunction(callbacks.onSuccess)) {
          callbacks.onSuccess(entity);
        }
      }
    });
  }

};
/**
 * @namespace
 * Chat State Notifications Mixins
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification = {};

/**
 * @class
 * Chat State Notifications Mixin for XC.Entity
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification.Entity =
  /** @lends XC.Mixin.ChatStateNotification.Entity# */{

  /**
   * Send a chat state notification to another entity.
   *
   * @param {String} state The chat notification state:
   *                       'composing', 'paused', 'inactive', 'gone'.
   * @param {XC.Entity} to The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id] The ID to be associated with the message.
   * @returns {void}
   */
  sendChatStateNotification: function (state, to, thread, id) {
    var msg = XC.MessageStanza.extend({
      to: to,
      thread: thread,
      id: id,
      chatNotificationState: state
    });

    this.connection.send(msg.toStanzaXML().toString());
  }
};

XC.Base.mixin.call(XC.Mixin.ChatStateNotification.Entity,
  /** @lends XC.Mixin.ChatStateNotification.Entity# */{

  /**
   * @function
   * Send a composing message.
   *
   * @param {XC.Entity} to The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id] The ID to be associated with the message.
   * @returns {void}
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateComposing:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.Registrar.ChatStateNotification.STATES.COMPOSING
    ),

  /**
   * @function
   * Send a composing message.
   *
   * @param {XC.Entity} to The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id] The ID to be associated with the message.
   * @returns {void}
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStatePaused:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.Registrar.ChatStateNotification.STATES.PAUSED
    ),

  /**
   * @function
   * Send a inactive message.
   *
   * @param {XC.Entity} to The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id] The ID to be associated with the message.
   * @returns {void}
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateInactive:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.Registrar.ChatStateNotification.STATES.INACTIVE
    ),

  /**
   * @function
   * Send a gone message.
   * You MUST NOT re-use the same Thread ID after recieving a <gone/> message
   * from another entity. Generate a new Thread ID for any subsequest messages.
   *
   * @param {XC.Entity} to The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id] The ID to be associated with the message.
   * @returns {void}
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateGone:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.Registrar.ChatStateNotification.STATES.GONE
    )
});

/**
 * @class
 * Chat State Notifications Mixins XC.MessageStanza
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification.Message =
  /** @lends  XC.Mixin.ChatStateNotification.Message# */{

  /**
   * The chat notification state of the message.
   * Defaults to 'active';
   * can be any in XC.Registrar.ChatStateNotification.STATES.
   * @type String
   */
  chatNotificationState: XC.Registrar.ChatStateNotification.STATES.ACTIVE,

  /**
   * @private
   * Unpack the chat state from the message.
   *
   * @param {Function} $super The function that this is wrapped around.
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    // Add Chat State Notifications as a discoverable service
    if (this.connection) {
      //TODO This is wrong. This an architectural problem,
      // and needs to be fixed as a general case for Mixins that register
      // their own features. This can be optimized, since it does a linear
      // lookup on to check for conflicts in addFeature, not adding it if
      // the feature already exists.
      // <tim.evans@junctionnetworks.com>
      var registrar = XC.Base.extend(XC.Mixin.Discoverable, {
        connection: this.connection
      });
      registrar.addFeature(XC.Registrar.ChatStateNotification.XMLNS);
    }

    if (this.packet) {
      var pkt = this.packet, stateNode;

      stateNode = XC_DOMHelper.getElementsByNS(pkt.getNode(),
                    XC.Registrar.ChatStateNotification.XMLNS);
      stateNode = stateNode[0];

      if (stateNode) {
        this.chatNotificationState = stateNode.nodeName;
      }
    }
  }.around(),

  /**
   * Append the chat state child to the message when it
   * is translated into a stanza.
   *
   * @param {Function} $super The function that this is wrapped around.
   * @returns {XC.XML.XMPP.Message} A constructed chat message.
   */
  toStanzaXML: function ($super) {
    var msg = $super.apply(this, Array.from(arguments).slice(1));
    if (this.chatNotificationState) {
      msg.addChild(XC.XML.Element.extend({
        name: this.chatNotificationState,
        xmlns: XC.Registrar.ChatStateNotification.XMLNS
      }));
    }

    return msg;
  }.around()
};
/**
 * @class
 * Roster Management
 *
 * @extends XC.Base
 * @extends XC.Mixin.HandlerRegistration
 * @extends XC.Mixin.RosterX.Service
 *
 * @see <a href="http://www.ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 7 & 8</a>
 */
XC.Service.Roster = XC.Base.extend(XC.Mixin.RosterX.Service,
                                   XC.Mixin.HandlerRegistration,
  /** @lends XC.Service.Roster# */{

  /**
   * Register for incoming stanzas
   *
   * @param {Function} $super The parent init function.
   * @private
   */
  init: function ($super) {
    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));
    }

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'iq',
        xmlns: XC.Registrar.Roster.XMLNS
      }, this._handleRosterItems, this);
    }

    return this;
  }.around(),

  /**
   * Request your roster from the server.
   *
   * @param {Object} [callbacks]
   *    An Object with 'onError' and 'onSuccess'.
   *   @param {Function} [callbacks.onError]
   *      A function taking a stanza as a parameter.
   *     @param {XC.PacketAdapter} [callbacks.onError#packet]
   *        The packet passed into XC.
   *   @param {Function} [callbacks.onSuccess]
   *      A function taking a list of entities.
   *     @param {XC.Entity[]} [callbacks.onSuccess#entities]
   *        A list of entities retrieved from your roster.
   */
  requestItems: function (callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Roster.XMLNS}),
        that = this;
    iq.type('get');
    iq.addChild(q);

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else {
        packet = packet.getNode();
        var items = packet.getElementsByTagName('item'),
            entities = [], itemsLength = items.length;

        for (var i = 0; i < itemsLength; i++) {
          entities.push(that._entityFromItem(items[i]));
        }

        if (callbacks && callbacks.onSuccess &&
            XC.isFunction(callbacks.onSuccess)) {
          callbacks.onSuccess(entities);
        }
      }
    });
  },

  /**
   * Call {@link this.registerHandler} with "onRosterItems" to register
   * for incoming roster items.
   * @name XC.Service.Roster#onRosterItems
   * @event
   * @param {XC.Entity[]} entities A list of entities pushed by the server.
   */

  /**
   * Handle incoming out-of-band Roster IQs
   *
   * @private
   * @param {XC.PacketAdapter} packet The incoming XML stanza.
   */
  _handleRosterItems: function (packet) {
    var type = packet.getType();
    packet = packet.getNode();

    // Acknowledge a roster push.
    if (type === 'set') {
      var iq = XC.XML.XMPP.IQ.extend();
      iq.type('result');
      iq.attr('id', packet.getAttribute('id'));
      this.connection.send(iq.toString());

    // Process the items passed from the roster.
    }
    var items = packet.getElementsByTagName('item'),
        itemsLength = items.length, entities = [];

    for (var i = 0; i < itemsLength; i++) {
      entities.push(this._entityFromItem(items[i]));
    }
    this.fireHandler('onRosterItems', entities);
  },

  /**
   * Construct an {@link XC.Entity} from a XML fragment from a Roster IQ.
   *
   * @private
   * @param {Element} item A node that contains info about a roster item.
   */
  _entityFromItem: function (item) {
    var entity = this.connection.Entity.extend({
      jid: item.getAttribute('jid'),
      roster: {
        subscription: item.getAttribute('subscription'),
        ask: item.getAttribute('ask'),
        name: item.getAttribute('name'),
        groups: []
      }
    });

    var groups = item.getElementsByTagName('group');
    for (var j = 0, len = groups.length; j < len; j++) {
      entity.roster.groups.push(XC_DOMHelper.getTextContent(groups[j]));
    }
    return entity;
  }

});
/**
 * @class
 * One-to-one Chatting
 *
 * @extends XC.Base
 * @extends XC.Mixin.Discoverable
 * @extends XC.Mixin.HandlerRegistration
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 4</a>
 */
XC.Service.Chat = XC.Base.extend(XC.Mixin.Discoverable,
                                 XC.Mixin.HandlerRegistration,
  /** @lends XC.Service.Chat# */{

  /**
   * Register for incoming stanzas
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'message',
        type: 'chat'
      }, this._handleMessages, this);
    }

    return this;
  }.around(),

  /**
   * Call this.registerHandler with "onMessage" to register for incoming
   * messages of type 'chat'.
   * @name XC.Service.Chat#onMessage
   * @event
   * @param {XC.MessageStanza} message A message sent to this resource.
   */

  /**
   * Handles out-of-band messages (All incoming messages)
   * from another entity.
   *
   * @param {Element} packet The incoming XML stanza.
   */
  _handleMessages: function (packet) {
    var msg = this.connection.MessageStanza.extend({
      packet: packet
    });

    this.fireHandler('onMessage', msg);
  }
});
/**
 * @class
 * Presence
 *
 * @extends XC.Base
 * @extends XC.Mixin.HandlerRegistration
 *
 * @see <a href="http://www.ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 5 & 6</a>
 */
XC.Service.Presence = XC.Base.extend(XC.Mixin.HandlerRegistration,
  /** @lends XC.Service.Presence# */ {

  /**
   * Register for incoming stanzas
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'presence'
      }, this._handlePresence, this);
    }
    return this;
  }.around(),

  /**
   * Broadcast presence to all users subscribed to your presence.
   *
   * @param {String} [show] 'away', 'chat', 'dnd', or 'xa'
   *                        as defined in XC.Registrar.Presence.SHOW
   * @param {String} [status] The custom status message to send.
   * @param {Number} [priority] An integer between -127 and +128
   *                            giving the priority of the presence.
   */
  send: function (show, status, priority) {
    var p = XC.PresenceStanza.extend({
      show: show,
      status: status,
      priority: priority
    });

    this.connection.send(p.toStanzaXML().toString());
  },

  /**
   * Send 'unavailable' presence.
   *
   * @param {String} [status] A custom message, typically giving
   *                          a reason why the user is unavailable.
   */
  sendUnavailable: function (status) {
    var p = XC.PresenceStanza.extend({
      type: 'unavailable',
      status: status
    });

    this.connection.send(p.toStanzaXML().toString());
  },

  /**
   * Call {@link this.registerHandler} with "onPresence" to register for
   * inbound presence stanzas when there is no type or the user becomes
   * "unavailable".
   * @name XC.Service.Presence#onPresence
   * @event
   * @param {XC.Entity} entity An entity representing a presence probe
   *                           response from the server.
   */

  /**
   * Call {@link this.registerHandler} with "onSubscribe" to register for
   * subscription requests.
   * @name XC.Service.Presence#onSubscribe
   * @event
   * @param {XC.PresenceStanza} request
   *    A bundled function to respond easily to the request.
   */

  /**
   * Call {@link this.registerHandler} with "onSubscribed" to register for
   * an event when you have been subscribed to an entity.
   * @name XC.Service.Presence#onSubscribed
   * @event
   * @param {XC.PresenceStanza} request
   *    A bundled function to respond easily to the request.
   */

  /**
   * Call {@link this.registerHandler} with "onUnubscribe" to register for
   * unsubscribe notifications.
   * @name XC.Service.Presence#onUnsubscribe
   * @event
   * @param {XC.PresenceStanza} request
   *    A bundled function to respond easily to the request.
   */

  /**
   * Call {@link this.registerHandler} with "onUnubscribed" to register for
   * unsubscribed notifications.
   * @name XC.Service.Presence#onUnsubscribed
   * @event
   * @param {XC.PresenceStanza} request
   *    A bundled function to respond easily to the request.
   */

  /**
   * Handle out-of-band presence stanzas
   *
   * @private
   * @param {Element} packet The incoming XML stanza.
   */
  _handlePresence: function (packet) {
    var jid = packet.getFrom(),
        type = packet.getType(),
        entity = this.connection.Entity.extend({jid: jid, presence: {}}),
        connection = this.connection,
        presence = connection.PresenceStanza.extend({packet: packet});

    if (!type) {
      entity.presence.available = true;
      entity.presence.show = presence.show;
      entity.presence.status = presence.status;
      entity.presence.priority = presence.priority;
      this.fireHandler('onPresence', entity);
    }

    switch (type) {
    case 'error':
      break;
    case 'probe': // Server-side only
      break;
    case 'subscribe':
    case 'subscribed':
    case 'unsubscribe':
    case 'unsubscribed':
      this.fireHandler('on' + type.charAt(0).toUpperCase() + type.slice(1), presence);
      break;
    case 'unavailable':
      entity.presence.available = false;
      entity.presence.status = presence.status;
      this.fireHandler('onPresence', entity);
      break;
    }
  }

});
/**
 * @class
 * The Disco Service provides high level support,
 * responding to disco requests on behalf of the user.
 *
 * @extends XC.Base
 * @extends XC.Mixin.Discoverable
 */
XC.Service.Disco = XC.Base.extend(XC.Mixin.Discoverable, 
                                  XC.Mixin.HandlerRegistration,
  /** @lends XC.Service.Disco# */ {

  /**
   * Register for incoming stanzas
   *
   * @param {Function} $super The parent init function.
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.connection) {
      this.connection.registerStanzaHandler({
        element: 'iq',
        xmlns: XC.Registrar.Disco.XMLNS + '#info'
      }, this._handleDiscoInfo, this);
      this.connection.registerStanzaHandler({
        element: 'iq',
        xmlns: XC.Registrar.Disco.XMLNS + '#items'
      }, this._handleDiscoItems, this);

      this.addFeature(XC.Registrar.Disco.XMLNS + '#info')
          .addFeature(XC.Registrar.Disco.XMLNS + '#items');
    }
    return this;
  }.around(),

  /**
   * Something went wrong- gracefully degrade and provide an
   * error message to the querying JID.
   *
   * @param {Element} iq The iq containing the elements to send.
   * @private
   */
  _handleError: function (iq) {
    iq.type('error');
    var error = XC.XML.XMPP.Error.extend(),
    itemNotFound = XC.XML.Element.extend({
      name: 'item-not-found',
      xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'
    });
    error.attr('type', 'cancel');
    error.addChild(itemNotFound);
    iq.addChild(error);
    this.connection.send(iq.toString());
  },

  /**
   * Disco items request on this entity.
   *
   * @param {Element} packet
   * @private
   */
  _handleDiscoItems: function (packet) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Disco.XMLNS + '#items'}),
        Item = XC.XML.Element.extend({name: 'item'}),
        item, node, value, len;

    if (packet.getType() !== 'get') {
      return;
    }

    iq.type('result');
    iq.to(packet.getFrom());
    iq.addChild(q);

    packet = packet.getNode();
    node = packet.getElementsByTagName('query')[0].getAttribute('node');
    if (node) {
      q.attr('node', node);
      node = this._rootNode.nodes[node];
      if (!node) {
        this._handleError(iq);
        return;
      }
    } else {
      node = this._rootNode;
    }

    len = node.items.length;
    for (var i = 0; i < len; i++) {
      value = node.items[i];
      item = Item.extend();
      item.attr('jid', value.jid);
      if (value.name) {
        item.attr('name', value.name);
      }
      if (value.node) {
        item.attr('node', value.node);
      }
      q.addChild(item);
    }

    this.connection.send(iq.toString());
  },

  /**
   * Disco info request on this entity.
   *
   * @param {XC.Entity} entity
   * @private
   */
  _handleDiscoInfo: function (packet) {
    var iq = XC.XML.XMPP.IQ.extend(),
        q = XC.XML.XMPP.Query.extend({xmlns: XC.Registrar.Disco.XMLNS + '#info'}),
        Feature = XC.XML.Element.extend({name: 'feature'}),
        Identity = XC.XML.Element.extend({name: 'identity'}),
        identity, elem, len, node, i;

    if (packet.getType() !== 'get') {
      return;
    }

    iq.type('result');
    iq.to(packet.from);
    iq.addChild(q);

    packet = packet.getNode();
    node = packet.getElementsByTagName('query')[0].getAttribute('node');
    if (node) {
      q.attr('node', node);
      node = this._rootNode.nodes[node];
      if (!node) {
        this._handleError(iq);
        return;
      }
    } else {
      node = this._rootNode;
    }

    len = node.identities ? node.identities.length : 0;
    for (i = 0; i < len; i++) {
      identity = node.identities[i];
      elem = Identity.extend();
      elem.attr('category', identity.category);
      elem.attr('type', identity.type);
      if (identity.name) {
        elem.attr('name', identity.name);
      }
      q.addChild(elem);
    }

    len = node.features ? node.features.length : 0;
    for (i = 0; i < len; i++) {
      elem = Feature.extend();
      elem.attr('var', node.features[i]);
      q.addChild(elem);
    }

    this.connection.send(iq.toString());
  }

});
/**
 * @namespace
 * Namespace for vCard Mixins.
 * @see XC.Mixin.VCard.Entity
 */
XC.Mixin.VCard = {};

/**
 * @class
 * vCards provide contextual information about a user.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0054.html">XEP-0054: vcard-temp</a>
 * @see <a href="http://tools.ietf.org/html/rfc2426">RFC 2426: vCard MIME</a>
 */
XC.Mixin.VCard.Entity = /** @lends XC.Mixin.VCard.Entity# */{

  /**
   * The XML formatted vCard.
   * It's left in a raw format because of
   * loose interpretations of the format.
   * @type Element
   */
  vCard: null,
  
  /**
   * Retrieve a user's vCard.
   * @param {Object} callbacks An Object with methods 'onSuccess' and 'onError'
   *   @param {Function} callbacks.onError Called when an error occurred.
   *     @param {XC.PacketAdapter} callbacks.onError#packet
   *       The packet that caused the error.
   *   @param {Function} callbacks.onSuccess Called on a successful vCard get.
   *     @param {XC.Entity} callbacks.onSuccess#entity
   *       The entity that vCard information was requested for.
   * @returns {void}
   */
  getVCard: function (callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        vCard = XC.XML.Element.extend({name: 'vCard',
                                       xmlns: XC.Registrar.VCard.XMLNS}),
        entity = this;
    iq.to(this.getBareJID());
    iq.type('get');
    iq.addChild(vCard);

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else {
        entity.vCard = XC_DOMHelper.getElementsByNS(packet.getNode(),
                                                    XC.Registrar.VCard.XMLNS)[0];

        if (callbacks && callbacks.onSuccess &&
            XC.isFunction(callbacks.onSuccess)) {
          callbacks.onSuccess(entity);
        }
      }
    });
  }

};
/**
 * @class
 * vCards provide contextual information about a user.
 *
 * @see <a href="http://xmpp.org/extensions/xep-0054.html">XEP-0054: vcard-temp</a>
 * @see <a href="http://tools.ietf.org/html/rfc2426">RFC 2426: vCard MIME</a>
 */
XC.Service.VCard = XC.Base.extend(XC.Mixin.Discoverable,
  /** @lends XC.Service.VCard# */{

  /** @private */
  init: function ($super) {
    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));      
    }

    if (this.connection) {
      this.addFeature(XC.Registrar.VCard.XMLNS);
    }
  }.around(),

  /**
   * Retrieve your vCard.
   * @param {Object} callbacks An Object with methods 'onSuccess' and 'onError'
   *   @param {Function} callbacks.onError Called when an error occurred.
   *     @param {XC.PacketAdapter} callbacks.onError#packet
   *       The packet that caused the error.
   *   @param {Function} callbacks.onSuccess Called on a successful vCard get.
   *     @param {Element} callbacks.onSuccess#vCard
   *       The vCard information as an XML Document fragment.
   */
  get: function (callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        vCard = XC.XML.Element.extend({name: 'vCard',
                                       xmlns: XC.Registrar.VCard.XMLNS});
    iq.type('get');
    iq.addChild(vCard);

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
          XC.isFunction(callbacks.onSuccess)) {
        callbacks.onSuccess(XC_DOMHelper.getElementsByNS(
                              packet.getNode(),
                              XC.Registrar.VCard.XMLNS)[0]);
      }
    });
  },

  /**
   * Update your vCard.
   * @param {Element} vCard The vCard XML document to send to the server.
   * @param {Object} callbacks An Object with methods 'onSuccess' and 'onError'
   *   @param {Function} callbacks.onError Called when an error occurred.
   *     @param {XC.PacketAdapter} callbacks.onError#packet
   *       The packet that caused the error.
   *   @param {Function} callbacks.onSuccess Called on a successful vCard get.
   */
  set: function (vCard, callbacks) {
    var iq = XC.XML.XMPP.IQ.extend(),
        rawVCard = XC.Base.extend({ toString: function () {
                                      return XC_DOMHelper.serializeToString(vCard);
                                    }
                                  });
    iq.type('set');
    iq.addChild(rawVCard);

    this.connection.send(iq.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
          XC.isFunction(callbacks.onSuccess)) {
        callbacks.onSuccess();
      }
    });
  }

});
/**
 * @class
 * Private Storage
 *
 * Provides an API to read and write XML to / from private XML storage.
 * Note that this implementation is based off of the historical XEP,
 * and should <b>NOT</b> be used if your XMPP server supports PubSub.
 *
 * If your server supports PubSub, use <a href="http://xmpp.org/extensions/xep-0223.html">
 * XEP-0223: Persistent Storage of Private Data via PubSub</a>, which
 * is the recommended way of synchronizing private data.
 *
 * @extends XC.Base
 * @see <a href="http://xmpp.org/extensions/xep-0049.html">XEP-0049: Private XML Storage</a>
 */
XC.Service.PrivateStorage = XC.Base.extend(/** @lends XC.Service.PrivateStorage# */{

  /**
   * Retrieve the private storage in the given
   * tagname and namespace.
   *
   * @param {Object} callbacks An Object with methods 'onSuccess' and 'onError'
   *   @param {Function} callbacks.onError Called when an error occurred.
   *     @param {XC.PacketAdapter} callbacks.onError#packet
   *       The packet that caused the error.
   *   @param {Function} callbacks.onSuccess Called on a successful storage set.
   *     @param {Element} callbacks.onSuccess#xml
   *       The private storage element as an XML Document fragment.
   * @returns {void}
   * @example
   *   xc.PrivateStorage.get('recipes', 'chef:cookbook', {
   *     success: function (xml) {
   *       // process XML document fragment here...
   *     }
   *   });
   */
  get: function (tag, namespace, callbacks) {
    var xml = XC.XML.Element.xmlize({
      attrs: { type: 'get' },
      children: [{
        name: 'query',
        xmlns: XC.Registrar.PrivateStorage.XMLNS,
        children: [{
          name: tag,
          xmlns: namespace
        }]
      }]
    }, XC.XML.XMPP.IQ.extend());

    this.connection.send(xml.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
          XC.isFunction(callbacks.onSuccess)) {
        var query = XC_DOMHelper.getElementsByNS(
                      packet.getNode(),
                      XC.Registrar.PrivateStorage.XMLNS)[0];
        callbacks.onSuccess(XC_DOMHelper.getElementsByNS(query, namespace)[0]);
      }
    });
  },

  /**
   * Set the private storage in the given tagname and namespace.
   *
   * Keep in mind that private storage does not provide any
   * capabilities for editing parts of an item. This means
   * that whatever you set the element to will override existing
   * data.
   *
   * @param {String} tag The tag name of the element to set.
   * @param {String} xmlns The namespace of the element to set.
   * @param {Object} content The content to set the element to in
   *   the format as described in {@link XC.Element.xmlize}.
   * @param {Object} callbacks An Object with methods 'onSuccess' and 'onError'
   *   @param {Function} callbacks.onError Called when an error occurred.
   *     @param {XC.PacketAdapter} callbacks.onError#packet
   *       The packet that caused the error.
   *   @param {Function} callbacks.onSuccess Called on a successful storage set.
   * @returns {void}
   * @example
   *   xc.PrivateStorage.set('recipes', 'chef:cookbook', [{
   *     name: 'recipe',
   *     children: [{
   *       name: 'title',
   *       text: 'Chocolate Moose'
   *     }, {
   *       name: 'author',
   *       text: 'Swedish Chef'
   *     }, {
   *       name: 'instructions',
   *       children: [{
   *         name: 'step',
   *         attrs: { 'no': 1 },
   *         text: 'Get chocolate.'
   *       }, {
   *         name: 'step',
   *         attrs: { 'no': 2 },
   *         text: 'Get a moose.'
   *       }, {
   *         name: 'step',
   *         attrs: { 'no': 3 },
   *         text: 'Put the chocolate on the moose.'
   *       }]
   *     }]
   *   }]);
   *
   *   // This will send the following XML to be stored:
   *   // => <recipes xmlns="chef:cookbook">
   *   //      <recipe>
   *   //        <title>Chocolate Moose</title>
   *   //        <author>Swedish Chef</author>
   *   //        <instructions>
   *   //          <step no="1">Get chocolate.</step>
   *   //          <step no="2">Get a moose.</step>
   *   //          <step no="3">Put the chocolate on the moose.</step>
   *   //        </instructions>
   *   //      </recipe>
   *   //    </recipes>
   */
  set: function (tag, namespace, content, callbacks) {
    var xml = XC.XML.Element.xmlize({
      attrs: { type: 'set' },
      children: [{
        name: 'query',
        xmlns: 'jabber:iq:private',
        children: [{
          name: tag,
          xmlns: namespace,
          children: content
        }]
      }]
    }, XC.XML.XMPP.IQ.extend());

    this.connection.send(xml.toString(), function (packet) {
      if (packet.getType() === 'error' &&
          callbacks && callbacks.onError &&
          XC.isFunction(callbacks.onError)) {
        callbacks.onError(packet);
      } else if (callbacks && callbacks.onSuccess &&
          XC.isFunction(callbacks.onSuccess)) {
        callbacks.onSuccess();
      }      
    });
  }

});
/**
 * @class
 * An entity is anything with a Jabber ID (JID).
 *
 * @requires XC.Connection A connection to do action on.
 *
 * @extends XC.Base
 * @extends XC.Mixin.Presence
 * @extends XC.Mixin.Roster
 * @extends XC.Mixin.Chat
 * @extends XC.Mixin.Disco
 * @extends XC.Mixin.JID
 * @extends XC.Mixin.ChatStateNotification.Entity
 * @extends XC.Mixin.VCard.Entity
 */
XC.Entity = XC.Base.extend(/** @lends XC.Entity# */{
  /**
   * The Jabber ID of the entity.
   * @type String
   */
  jid: null

}, XC.Mixin.JID,
   XC.Mixin.Presence,
   XC.Mixin.Roster,
   XC.Mixin.Chat,
   XC.Mixin.ChatStateNotification.Entity,
   XC.Mixin.Disco,
   XC.Mixin.VCard.Entity);
/**
 * @class
 * Simple class for unpacking stanzas.
 *
 * @extends XC.Base
 */
XC.Stanza = XC.Base.extend(/** @lends XC.Stanza# */{

  /**
   * @private
   * Unpack 'to', 'from', 'type', 'id', and 'xmlns'
   * from the packet into the object.
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.packet) {
      if (!this.connection) {
        throw new XC.Error("If a stanza is created with a packet, it MUST " +
                           "have a connection associated with it.");
      }
      var pkt = this.packet;

      this.mixin({
        to: this.connection.Entity.extend({jid: pkt.getTo()}),
        from: this.connection.Entity.extend({jid: pkt.getFrom()}),
        type: pkt.getType(),
        id: pkt.getNode().getAttribute('id'),
        xmlns: pkt.getNode().getAttribute('xmlns')
      });
    }
  }.around(),

  /**
   * The Entity the stanza was sent to.
   * @type XC.Entity
   */
  to: null,

  /**
   * The Entity the stanza was sent from.
   * @type XC.Entity
   */
  from: null,

  /**
   * The ID attached to the stanza.
   * @type String
   */
  id: null,

  /**
   * The type attribute associated with the stanza.
   * @type String
   */
  type: null,

  /**
   * The base XML Element to create the stanza.
   * Used in templates that extend Stanza.
   * @private
   * @example
   *   xmlStanza: XC.XML.XMPP.Message
   */
  xmlStanza: null,

  /**
   * Sends the XML fragment.
   * @returns {void}
   */
  send: function () {
    this.connection.send(this.toStanzaXML().toString());
  },

  /**
   * Converts a stanza into an XML Fragment.
   *
   * @returns {XC.XML.Element} A XML Fragment.
   */
  toStanzaXML: function ($super) {
    if (!this.xmlStanza) {
      throw new XC.Error('undefined XML stanza type');
    }

    var stanza = $super.apply(this, Array.from(arguments).slice(1)) ||
                                    this.xmlStanza.extend();

    if (this.to) {
      stanza.attr('to', this.to.jid);
    }
    if (this.from) {
      stanza.attr('from', this.from.jid);
    }
    if (this.id) {
      stanza.attr('id', this.id);
    }
    if (this.type) {
      stanza.attr('type', this.type);
    }

    return stanza;
  }.around()

});
/**
 * @class
 * Delayed Delivery provides timestamp information about data stored for later delivery.
 * The most common uses of delayed delivery are:
 * <ul>
 *   <li>A message that is sent to an offline entity for later delivery.</li>
 *   <li>The last available presence stanza sent by a connected client to a server.</li>
 *   <li>Messages cached by a Multi-User Chat room for delivery to new participants when they join the room.</li>
 * </ul>
 * @extends XC.Base
 *
 * @see <a href="http://xmpp.org/extensions/xep-0203.html">XEP-0203: Delayed Delivery</a>
 */
XC.Mixin.DelayedDelivery = /** @lends XC.Mixin.DelayedDelivery# */{

  /**
   * @namespace
   * Slots for delay elements.
   */
  delay: {

    /**
     * The 'from' attribute of the delay node.
     * @type {String}
     */
    from: null,

    /**
     * The 'stamp' attribute of the delay node, as a UTC string.
     * @type {String}
     */
    stamp: null,

    /**
     * The text message sent as the body of the delay node,
     * providing infomation on why the mesage was delayed.
     * @type {String}
     */
    text: null
  },

  /**
   * @private
   * Look for the delay element and the delay namespace,
   * pulling out the 'from' and 'stamp' attibutes and
   * info body.
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.packet) {
      var pkt = this.packet, delayNode;

      delayNode = XC_DOMHelper.getElementsByNS(pkt.getNode(),
                    XC.Registrar.DelayedDelivery.XMLNS);
      delayNode = delayNode[0];

      if (delayNode) {
        this.delay = {
          from: delayNode.getAttribute('from'),
          stamp: delayNode.getAttribute('stamp'),
          text: XC_DOMHelper.getTextContent(delayNode) || ''
        };
      }
    }
  }.around()

};
/**
 * @class
 * Simple Message class for XMPP Message stanzas
 * @extends XC.Stanza
 * @extends XC.Mixin.ChatStateNotification.Message
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 4</a>
 */
XC.MessageStanza = XC.Stanza.extend(XC.Mixin.ChatStateNotification.Message,
  XC.Mixin.DelayedDelivery, /** @lends XC.MessageStanza# */{

  type: 'chat',

  /**
   * @private
   * Unpack a message from a packet, or just do an ordinary init.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.packet) {
      var node = this.packet.getNode();
      this.mixin({
        body: XC_DOMHelper.getTextContent(
                node.getElementsByTagName('body')[0]
              ),
        thread: XC_DOMHelper.getTextContent(
                  node.getElementsByTagName('thread')[0]
                ),
        subject: XC_DOMHelper.getTextContent(
                   node.getElementsByTagName('subject')[0]
                 )
      });
    }
  }.around(),

  /**
   * The subject of the message.
   * @type String
   */
  subject: null,

  /**
   * The body of the message.
   * @type String
   */
  body: null,

  /**
   * The message thread.
   * @type String
   */
  thread: null,

  /**
   * Reply to a message using this
   * message as a template, switching the
   * to and from attributes.
   *
   * @param {String} body The message body.
   * @param {String} [id] The id to associate with the message.
   * @returns {XC.MessageStanza} The sent message.
   */
  reply: function (body, id) {
    var msg = this.extend({
      to: this.from,
      body: body,
      id: id
    });

    this.connection.send(msg.toStanzaXML().toString());
  },

  /**
   * @private
   * The builder for XC.Stanza's base toStanzaXML
   */
  xmlStanza: XC.XML.XMPP.Message,

  /**
   * Converts a message into an XML Fragment.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   * @returns {XC.XML.Element} A XML Fragment.
   */
  toStanzaXML: function ($super) {
    var msg = $super.apply(this, Array.from(arguments).slice(1));

    var els = ['body', 'subject', 'thread'];
    for (var i = 0; i < els.length; i++) {
      if (!this[els[i]]) {
        continue;
      }

      msg.addChild(XC.XML.Element.extend({
        name: els[i],
        text: this[els[i]]
      }));
    }

    return msg;
  }.around()
});
/**
 * @namespace
 * Generic Presence stanza creation and parsing.
 * @extends XC.Stanza
 */
XC.PresenceStanza = XC.Stanza.extend(XC.Mixin.DelayedDelivery, /** @lends XC.PresenceStanza# */{

  /**
   * The &lt;show&gt; XML fragment of the packet.
   * @type XC.Registrar.Presence.SHOW
   */
  show: null,

  /**
   * The &lt;status&gt; XML fragment of the packet.
   * @type String
   */
  status: null,

  /**
   * The &lt;priority&gt; XML fragment of the packet,
   * between -128 and +127.
   * @type Number
   */
  priority: null,

  /**
   * Unpack a message from a packet, or just do an ordinary init.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.packet) {
      var node = this.packet.getNode();
      this.mixin({
        show: XC_DOMHelper.getTextContent(
                node.getElementsByTagName('show')[0]
              ),
        status: XC_DOMHelper.getTextContent(
                  node.getElementsByTagName('status')[0]
                ),
        priority: parseInt(XC_DOMHelper.getTextContent(
                   node.getElementsByTagName('priority')[0]
                  ), 10)
      });
    }
  }.around(),

  /**
   * Accept a subscription request.
   * @returns {void}
   */
  accept: function () {
    var p = XC.PresenceStanza.extend();

    switch (this.type) {
    case 'subscribe':
      p.type = 'subscribed';
      break;
    case 'subscribed':
      p.type = 'subscribe';
      break;
    case 'unsubscribe':
      p.type = 'unsubscribed';
      break;
    case 'unsubscribed':
      p.type = 'unsubscribe';
      break;
    default:
      return;
    }

    p.to = this.from;
    p.to.connection.send(p.toStanzaXML().toString());
  },

  /**
   * Deny a subscription request.
   * @returns {void}
   */
  deny: function () {
    var p = XC.PresenceStanza.extend();

    switch (this.type) {
    case 'subscribe':
      p.type = 'unsubscribed';
      break;
    case 'subscribed':
      p.type = 'unsubscribe';
      break;
    case 'unsubscribe':
      p.type = 'subscribed';
      break;
    case 'unsubscribed':
      p.type = 'subscribe';
      break;
    default:
      return;
    }

    p.to = this.from;
    p.to.connection.send(p.toStanzaXML().toString());
  },

  /**
   * @private
   * The builder for XC.Stanza's base toStanzaXML
   */
  xmlStanza: XC.XML.XMPP.Presence,

  /**
   * Converts presence into an XML Fragment.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   * @returns {XC.XML.Element} A XML Fragment.
   */
  toStanzaXML: function ($super) {
    var msg = $super.apply(this, Array.from(arguments).slice(1));

    var els = ['status', 'priority'];

    if (this.show) {
      msg.addChild(XC.XML.Element.extend({
        name: 'show',
        text: this.show
      }));
    }

    if (this.status) {
      msg.addChild(XC.XML.Element.extend({
        name: 'status',
        text: this.status
      }));
    }

    if (this.priority &&
        this.priority > -128 && this.priority <= 127) {
      msg.addChild(XC.XML.Element.extend({
        name: 'priority',
        text: this.priority
      }));
    }

    return msg;
  }.around()
});
/**
 * @class
 * XC Connection Adapter abstract object.
 *
 * An instance of this object MUST be supplied to the XC.Connection
 * instance. This object is to be defined by consumers of the API as
 * an adapter to the XMPP connection library that is being used. See
 * the example for using the XC.ConnectionAdapter with the JSJaC XMPP
 * library.
 *
 * @example
 *   var conn = new JSJaCConnection({ httpbase: '/http-bind/' });
 *   var adapter = XC.ConnectionAdapter.extend({
 *     jid: function () { return conn.fulljid; },
 *
 *     registerHandler: function (event, handler) {
 *       return conn.registerHandler(event, handler);
 *     },
 *
 *     unregisterHandler: function (event, handler) {
 *       return conn.unregisterHandler(event, handler);
 *     },
 *
 *     send: function (xml, cb, args) {
 *       return conn._sendRaw(xml, cb, args);
 *     }
 *   });
 *
 *   var adapter = XC.Connection.extend({ connectionAdapter: adapter });
 *
 * @extends XC.Base
 */
XC.ConnectionAdapter = XC.Base.extend(/** @lends XC.ConnectionAdapter# */{

  /**
   * The JID of this connection.
   * @returns {String} The JID provided by your BOSH library.
   */
  jid: function () {
    throw new XC.Error("You MUST override XC.ConnectionAdapter#jid " +
                       "so it returns the JID of the BOSH connection.");
  },

  /**
   * Send an XML string to the underlying connection.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} args An array of arguments to be passed to callback after the packet.
   * @returns {void}
   *
   * @see XC.Connection#send
   */
  send: function (xml, callback, args) {
    throw new XC.Error("You MUST override XC.ConnectionAdapter#send " +
                       "so it will send XML over the BOSH connection.");
  },

  /**
   * Registers an event handler.
   *
   * @param {String} event The type of stanza for which to listen (i.e., `message', `iq', `presence.')
   * @param {Function} handler The stanza is passed to this function when it is received.
   * @returns {void}
   */
  registerHandler: function (event, handler) {
    throw new XC.Error("You MUST override XC.ConnectionAdapter#registerHandler " +
                       "so it will handle events the BOSH connection recieves.");
  },

  /**
   * Unregisters an event handler.
   *
   * @param {String} event The type of stanza we were listening to (i.e., `message', `iq', `presence.')
   * @returns {void}
   */
  unregisterHandler: function (event) {
    throw new XC.Error("You MUST override XC.ConnectionAdapter#unregisterHandler " +
                       "so it will remove event handlers on the BOSH connection.");
  }

});
/**
 * @namespace
 * Connection object to use for all XC connections.
 * For a functioning connection, you MUST extend
 * {@link XC.Connection} with an implementation of
 * {@link XC.ConnectionAdapter}.
 *
 * @extends XC.Base
 * @property {XC.Service.Presence} Presence
 * @property {XC.Service.Roster} Roster
 * @property {XC.Service.Chat} Chat
 * @property {XC.Service.Disco} Disco
 * @property {XC.Service.VCard} VCard
 *
 * @property {XC.Entity} Entity An Entity template to build Entities from.
 * @property {XC.MessageStanza} MessageStanza A MessageStanza template to build MessageStanzas from.
 * @property {XC.PresenceStanza} PresenceStanza A PresenceStanza template to build PresenceStanzas from.
 * @requires The property 'connectionAdapter' to be extended on a {@link XC.Connection}.
 *
 * @example
 *   var bosh = new Strophe.Connection('/http-bind/')
 *   var xmpp = XC.Connection.extend({
 *     connectionAdapter: XC.StropheAdapter.extend({
 *       connection: bosh
 *     })
 *   });
 *
 *   bosh.connect("juliet@example.com", "romeo", function (status) {
 *     if (status === Strophe.Status.CONNECTED) {
 *       // OK- Let's follow the RFC, and request the roster.
 *       xmpp.Roster.requestItems({
 *         onSuccess: function (entities) {
 *           xmpp.Presence.send(null, "Hello everyone!", 3);
 *
 *           // Say hi to everyone in your roster.
 *           var i = 0, len = entities.length, entity;
 *           for (i; i < len; i++) {
 *             entity[i].sendChat("Hello, " + entity[i].roster.name + "!\n" +
 *                                "How are you doing today?");
 *           }
 *         }
 *       });
 *     }
 *   });
 */
XC.Connection = XC.Base.extend(/** @lends XC.Connection# */{

  /**
   * @private
   * Map of template names to template objects. Used during
   * init to bootstrap services to a connection.
   */
  services: {
    Presence: XC.Service.Presence,
    Roster:   XC.Service.Roster,
    Chat:     XC.Service.Chat,
    Disco:    XC.Service.Disco,
    VCard:    XC.Service.VCard,
    PrivateStorage: XC.Service.PrivateStorage
  },

  /**
   * @private
   * Templates are extended with the connection (this) during init().
   */
  templates: {
    Entity: XC.Entity,
    MessageStanza: XC.MessageStanza,
    PresenceStanza: XC.PresenceStanza
  },

  /**
   * @private
   * Initializes the Connection with services and templates
   * hooked up with a connection and then stuck as top level objects.
   */
  init: function ($super) {
    if (this.connectionAdapter) {
      this._stanzaHandlers = this._stanzaHandlersTemplate.extend();

      for (var s in this.services) {
        if (this.services.hasOwnProperty(s)) {
          var service = this.services[s];
          this[s] = service.extend({connection: this});
        }
      }

      for (var t in this.templates) {
        if (this.templates.hasOwnProperty(t)) {
          this[t] = this.templates[t].extend({connection: this});
        }
      }

      // Register for all incoming stanza types.
      var that = this,
          events = ['iq', 'message', 'presence'],
          /** @ignore */
          dispatch = function (stanza) {
            if (that.DEBUG_PACKETS) {
              that._validatePacket(stanza);
            }
            that._dispatchStanza(stanza);
            return true;
          };
      for (var i = 0; i < events.length; i++) {
        this.connectionAdapter.registerHandler(events[i], dispatch);
      }
    }

    if (XC.isFunction($super)) {
      $super.apply(this, Array.from(arguments).slice(1));
    }
  }.around(),

  /**
   * Sends an XML string to the connection adapter.
   *
   * @param {String} xml The XML String to send.
   * @param {Function} callback Called when a response to this packet is received with the first argument being the received packet.
   * @param {Array} [args] An array of arguments to be passed to callback after the packet.
   * @returns {void}
   *
   * @see XC.ConnectionAdapter#send
   */
  send: function (xml, callback, args) {
    this.connectionAdapter.send(xml, callback, args || []);
  },

  /**
   * Returns the JID of this connection.
   *
   * @example
   *  xc.getJID();
   *
   * @returns {String} This connection's JID.
   *
   * @see XC.ConnectionAdapter#jid
   */
  getJID: function () {
    return this.connectionAdapter.jid();
  },

  /**
   * @private
   * Register a handler for a stanza based on the following criteria:
   * <ul>
   *   <li>element - The stanza element; 'iq', 'message', or 'presence'.</li>
   *   <li>xmlns   - The namespace of the stanza element OR first child.</li>
   *   <li>from    - The from JID.</li>
   *   <li>type    - The stanza type.</li>
   *   <li>id      - The stanza id.</li>
   * </ul>
   * This function is only to be called internally by the XC.Services.
   * Client libraries should register their callbacks with each service,
   * or directly with their bosh connection for services not provided
   * by the XC library.
   *
   * @param {Object} criteria has any of the members listed above
   * @param {Function} callback
   * @param {Object} [target] scope for 'this'
   * @returns {Mixed} id indicates success or false indicates failure
   */
  registerStanzaHandler: function (criteria, callback, target) {
    if (!XC.isFunction(callback)) {
      return false;
    }

    target = target || window || this;
    return this._stanzaHandlers.insert(criteria, function () {
      callback.apply(target, arguments);
    });
  },

  /**
   * @private
   * Unregister the stanza handler, given the return id.
   *
   * @param {Mixed} id The id returned from registerStanzaHandler.
   */
  unregisterStanzaHandler: function (id) {
    return this._stanzaHandlers.remove(id);
  },

  /**
   * @private
   * Set to true to debug packets, ensuring that they implement
   * the interface as described in {@link XC.PacketAdapter}.
   */
  DEBUG_PACKETS: false,

  /**
   * @private
   * Validates incoming packets to ensure that they implement
   * the packet interface as described in {@link XC.PacketAdapter}.
   *
   * @param {XC.PacketAdapter} packet Something that's supposed to implement the {@link XC.PacketAdapter} interface.
   */
  _validatePacket: function (p) {
    var pktInterface = /** @ignore */{
      getNode: function () {
        return p.getNode && p.getNode().nodeType;
      },
      getType: function () {
        return p.getType && XC.isString(p.getType());
      },
      getFrom: function () {
        return p.getFrom && XC.isString(p.getFrom());
      },
      getTo: function () {
        return p.getTo && XC.isString(p.getTo());
      }
    };

    for (var test in pktInterface) {
      if (pktInterface.hasOwnProperty(test)) {
        if (!pktInterface[test]()) {
          throw new XC.Error('Packet failed to validate ' + test);
        }
      }
    }
  },

  /**
   * @private
   * Find a set of registered callbacks whose set of criteria match the stanza
   * and call the callbacks with the stanza.
   */
  _dispatchStanza: function (stanza) {
    var callbacks = this._stanzaHandlers.findCallbacks(stanza);
    for (var i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i](stanza);
    }
  },

  /**
   * @private
   * @namespace
   * Stanza Handlers are registered by the Services to register a callback
   * for a specific stanza based on various criteria
   *
   * @see XC.Connection#registerStanzaHandler
   * @see XC.Connection#unregisterStanzaHandler
   */
  _stanzaHandlersTemplate: XC.Base.extend(
    /** @lends XC.Connection#_stanzaHandlersTemplate */{

    lastID: 0,
    store: {},

    /** @private */
    insert: function (criteria, cb) {
      var id = this.lastID++;
      this.store[id] = {
        criteria: criteria,
        callback: cb
      };

      return id;
    },

    /** @private */
    remove: function (id) {
      if (this.store[id]) {
        delete this.store[id];
        return true;
      }
      return false;
    },

    /** @private */
    findCallbacks: function (stanza) {
      var resultSet = [];

      for (var id in this.store) {
        if (this.store.hasOwnProperty(id)) {
          var callbackSet = this.store[id],
              criteria = callbackSet.criteria,
              cb = callbackSet.callback,
              domEl = stanza.getNode(),
              namespaces = XC_DOMHelper.getElementsByNS(domEl, criteria.xmlns);

          if (!cb || !criteria) {
            continue;
          }

          if (criteria.element && domEl.tagName !== criteria.element) {
            continue;
          }

          if (criteria.xmlns &&
              !(domEl.getAttribute('xmlns') === criteria.xmlns ||
                namespaces.length)) {
            continue;
          }

          if (criteria.from && stanza.getFrom() !== criteria.from) {
            continue;
          }

          if (criteria.type && stanza.getType() !== criteria.type) {
            continue;
          }

          if (criteria.id && domEl.getAttribute('id') !== criteria.id) {
            continue;
          }

          // we've passed all of our criteria tests
          resultSet.push(cb);
        }
      }
      return resultSet;
    }
  })
});
/**
 * @class
 * Provides a Connection Adapter for the BOSH library
 * <a href="http://code.stanziq.com/strophe">Strophe</a>.
 * The adapter tries to deal with possible memory leaks due to unanswered
 * IQs, having a max queue size of handlers. You should be able to plug-and-play
 * with this adapter and Strophe like the following example:
 *
 * @example
 *   var bosh = new Strophe.Connection('/http-bind/');
 *   var xc = XC.Connection.extend({
 *     connectionAdapter: XC.StropheAdapter.extend({
 *       connection: bosh
 *     })
 *   });
 * @extends XC.ConnectionAdapter
 * @requires A slot named "connection" with an instance of Strophe.Connection provided.
 */
XC.StropheAdapter = XC.ConnectionAdapter.extend(
  /** @lends XC.StropheAdapter# */{

  /** @private */
  _callbacks: {},
  /** @private */
  _handlers: {},
  /** @private */
  _callbackQueue: [],

  /**
   * <p>The maximum allowable size for the callback queue.
   * When it reaches the maximum size, it will warn you about it,
   * and begin removing stale handlers, assuming that they will never be called.
   * This exists as a catch for memory leaks. Change this value to meet your needs.</p>
   *
   * <p>You <i>will</i> be warned when this quota is reached.
   * Make sure that you aren't throwing away any live messages
   * if you want to keep the MAX_QUEUE_SIZE where it is.</p>
   */
  MAX_QUEUE_SIZE: 100,

  /** @private */
  init: function ($super) {
    this._callbacks = {};
    this._handlers = {};
    this._callbackQueue = [];
    $super();
  }.around(),

  /**
   * The connection's JID.
   * @returns {String} The JID associated with the connection.
   */
  jid: function () {
    return this.connection.jid;
  },

  /**
   * Subscribe to stanza via top-level XMPP tag name.
   *
   * @param {String} event The top level XMPP tag name to register for.
   * @param {Function} handler The function handler for the event.
   * @returns {void}
   */
  registerHandler: function (event, handler) {
    var that = this;

    var wrapper = function (stanza) {
      var packetAdapter = that.toPacket(stanza),
          newArgs = [packetAdapter];

      for (var i = 1, len = arguments.length; i < len; i++) {
        newArgs.push(arguments[i]);
      }

      try {
        handler.apply(this, newArgs);
      } catch (e) {
        XC.error('Error in XC handler: ' + handler +
                 '; Error: ' + e + '; response stanza: ' +
                 XC_DOMHelper.serializeToString(stanza));
        throw e;
      }
      return true;
    };

    this.unregisterHandler(event);
    this._handlers[event] = this.connection.addHandler(wrapper, null, event,
                                                       null, null, null);
  },

  /**
   * Unsubscribe from corresponding event.
   *
   * @param {String} event The event to unsubscribe from.
   * @returns {void}
   */
  unregisterHandler: function (event) {
    var queue = this._callbackQueue, i, len = queue.length, rest;

    if (this._handlers[event]) {
      this.connection.deleteHandler(this._handlers[event]);
      delete this._handlers[event];

      // Remove from the callback queue
      for (i = 0; i < len; i++) {
        if (queue[i] === event) {
          rest = queue.slice(i + 1, queue.length);
          queue.length = i;
          queue.push(rest);
          break;
        }
      }
    }
  },

  /**
   * Create a DOM node via XML.
   *
   * @private
   * @param {String} xml The xml string to convert into an object.
   * @returns {Element} The document fragment that represents the xml string.
   */
  createNode: function (xml) {
    var node = null, parser = null;
    if (window.ActiveXObject) {
      parser = new ActiveXObject("Microsoft.XMLDOM");
      parser.async = "false";
      parser.setProperty("SelectionLanguage", "XPath");
      parser.loadXML(xml);
      node = parser.firstChild;
    } else {
      parser = new DOMParser();
      node = parser.parseFromString(xml, 'text/xml');
      node = node.firstChild;
      document.adoptNode(node);
    }
    return node;
  },

  /**
   * Send the xml fragment over the connection.
   *
   * @param {Element} xml The xml document to send.
   * @param {Function} callback The function to call when done.
   * @param {Array} args A list of arguments to provide to the callback.
   * @returns {void}
   */
  send: function (xml, callback, args) {
    var node = this.createNode(xml),
        that = this;

    if (!this.connection.connected || this.connection.disconnecting) {
      XC.log('Prevented "' + XC_DOMHelper.serializeToString(xml) + '" ' +
             'from being sent because the BOSH connection is being ' +
             'disposed / is disposed.');
      return false;
    }

    if (callback) {
      var wrapper = function (stanza) {
        var packetAdapter = that.toPacket(stanza),
            newArgs = [packetAdapter],
            queue = that._callbackQueue, rest,
            event = node.getAttribute('id'), i, len;
        args = args || [];
        for (i = 0, len = args.length; i < len; i++) {
          newArgs.push(args[i]);
        }

        // Remove from the callback queue
        for (i = 0, len = queue.length; i < len; i++) {
          if (queue[i].toString() === event) {
            rest = queue.slice(i + 1, queue.length);
            queue.length = i;
            queue.push.apply(queue, rest);
            break;
          }
        }

        delete that._callbacks[event];

        try {
          callback.apply(this, newArgs);
        } catch (e) {
          XC.error('Error in XC handler: ' + callback +
                   '; Error: ' + e + '; response stanza: ' +
                   XC_DOMHelper.serializeToString(stanza));
          throw e;
        }

        return false;
      };

      var id = node.getAttribute('id');
      if (!id) {
        id = this.connection.getUniqueId();
        node.setAttribute('id', id);
      }

      this._callbacks[id] = this.connection.addHandler(wrapper, null, null,
                                                       null, id, null);
      this._callbackQueue.unshift(id);
      if (this._callbackQueue.length > this.MAX_QUEUE_SIZE) {
        XC.warn("You have too many callbacks waiting for a response, so I'm getting rid of the oldest one.\n" +
                "If this isn't desired, override the MAX_QUEUE_SIZE of XC.StropheAdapter.");
        delete this._callbacks[this._callbackQueue.pop()];
      }
    }
    return this.connection.send(node);
  },

  /**
   * @private
   * Convert a stanza into an object that implements {@link XC.PacketAdapter}.
   *
   * @param {Element} stanza The XMPP stanza to pack.
   *
   * @returns {XC.PacketAdapter} The stanza wrapped as a packet.
   */
  toPacket: function (stanza) {
    var to = stanza.getAttribute('to'),
        from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type');
    return {
      getFrom: function () {
        return from;
      },
      getType: function () {
        return type;
      },
      getTo: function () {
        return to;
      },
      getNode: function () {
        return stanza;
      }
    };
  }
});
