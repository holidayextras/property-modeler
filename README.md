This project aims to bring some level of data/type safety to NodeJS whilst allowing us to define clean data models.

Check out the tests for a clear picture of how powerful this is.

This is everything thrown together into one place for quick reference:
```js
	var Modeler = require("../Modeler.js");
	var className = 'MyClassName';

	var ThisClass = function(json) {
		// Class Function definitions here:
		this.toString = function() {
		  return this.PropertyName+" "+this.SomeOtherProperty;
		};
		
		// Class property definitions here:
		Modeler.extend(className, {
		  [PropertyName]: {
		    // all of these are optional!
		    type: "SomeOtherClass",
		    default: { DefaultValue },
		    required: true,
		    // filter will be run against all data entering this property
		    filter: {
		      { trim: true },
		      { replace: ['test', 'TEST'] },
		      { encode: 'base64' / 'json' / 'url' },
		      { decode: 'base64' / 'json' / 'url' },
		      { capitalise: true },
		      { toMoney: true },
		      { toUpperCase: true },
		      { toLowerCase: true }
		    },
		    filter: function(v) {
		      ...
		      return v;
		    },
		    // validation will be run against all data entering this property,
		    // AFTER the filter, AFTER type validation and BEFORE the value is set.
		    // Failing validation will throw away the new data.
		    validation: {
		      isIn: ['list', 'of', 'values'],
		      minlength: 2,
		      maxlength: 4,
		      before: new Date(),
		      after: new Date(),
		      regex: /regex/,
		      looksLike: 'postcode' / 'email',
		      min: 1,
		      max: 100
		    },
		    validation: function(v) {
		      ...
		      return true / false;
		    },
		    mask: Modeler.GET | Modeler.SET | Modeler.HIDDEN | Modeler.ARRAY 
		  },
		  [NextProperty]: {
		  .....
		}, this, json);
	};

	module.exports = ThisClass;
	Modeler.register(ThisClass, className);
```
