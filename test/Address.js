var Modeler = require("../lib/Modeler.js");

var className = 'Address';

var Address = function(json) {
  
  this.toString = function() {
    return this.Street+", "+this.Town+", "+this.County+", "+this.Postcode;
  };
  
  this.doubleUpStreet = function() {
    this.Street += this.Street;
  };
  
  Modeler.extend("Address", {
    Street: {
      type: "string",
      default: "",
      filter: [
        { toUpperCase: true },
        { encode: 'json' },
        { decode: 'json' },
      ]
    },
    Town: {
      type: "string",
      default: "",
      filter: [
        { toLowerCase: true },
        { encode: 'url' },
        { decode: 'url' },
      ]
    },
    County: {
      type: "string",
      default: ""
    },
    Postcode: {
      type: "string",
      // This field is required
      required: true,
      // This field should resemble a postcode
      validation: {
        looksLike: 'postcode'
      }
    }
  }, this, json);
};

module.exports = Address;
Modeler.register(Address, className);
