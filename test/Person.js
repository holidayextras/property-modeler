var Modeler = require("../lib/Modeler.js");

var className = 'Person';

var Person = function(json) {
  // This class should provide an addAddress function
  this.addAddress = function(newAddress) {
    // All our instances properties will be attached to 'this'
    // These properties are still bound by their rules
    this.Locations.push(newAddress);
  };
  
  this.getFullName = function() {
    return this.Title+" "+this.FirstName+" "+this.LastName;
  }
  
  // This is the part which enforces rules on each property:
  Modeler.extend("Person", {
    // We want a property called 'Title'
    Title: {
      // it should be a text string
      type: "string",
      // validation will be run whenever we try and set to this property
      //  -> The value must be within a specific list
      //  -> The min length of this property
      //  -> The max length of this property
      validation: {
        isIn: ['Mr', 'Mrs', 'Miss', 'Mstr', 'Sir'],
        minlength: 2,
        maxlength: 4
      }
    },
    FirstName: {
      type: "string",
      // filter will be run AFTER we attempt to set the property
      // and BEFORE it is actually set.
      //  -> replace takes an array of 2 values, text/regex to look for and text to replace with
      //  -> encode and decode allow 'base64', 'json' and 'url'
      //  ->  Capitalise Will Make Strings Look Like This
      filter: [
        { trim: true },
        { replace: ['test', 'TEST'] },
        { encode: 'base64' },
        { decode: 'base64' },
        { capitalise: true }
      ]
    },
    LastName: {
      type: "string",
      // filter can also be defined as a function, where we can write custom code
      filter: function(v) {
        // everything available in the other filter definition is available
        // within [this.]
        v = this.trim(v);
        v = this.replace(v, "test", "TEST");
        v = this.capitalise(v);
        return v;
      }
    },
    Locations: {
      type: "Address",
      // The mask defines how the property should behave. 
      // we can OR different properties together, the possible options are:
      // Modeler.GET, Modeler.SET, Modeler.ARRAY, Modeler.HIDDEN
      // the default is Modeler.GET | Modeler.SET which is read/write access
      // Modeler.ARRAY means the property should hold an array of values, each
      // of which must pass the type/filter/validation stuff
      mask: Modeler.GET | Modeler.SET | Modeler.ARRAY
    },
    NextOfKin: {
      // Type can also be the name of another class
      type: "Person"
    },
    DoB: {
      type: "date",
      validation: {
        // We can validate against before/after a date
        before: new Date(1992, 01, 01),
        after: new Date(1923, 01, 01)
      }
    },
    Expenses: {
      type: "string",
      mask: Modeler.GET | Modeler.SET | Modeler.ARRAY,
      filter: [
        { toMoney: true }
      ],
      validation: {
        looksLike: 'money'
      }
    },
    Age: {
      type: "number"
    }
  }, this, json);
};

module.exports = Person;
Modeler.register(Person, className);
