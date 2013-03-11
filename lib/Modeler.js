"use strict";

function Modeler(){ };
module.exports = Modeler;

var modelCache = { };

Modeler.extend = function(type, definition, obj, json) {
  json = json || { };
  var errors = [];
  var fatalErrors = 0;

  for (var p in definition) {
    var prop = definition[p];
    (function() {
      var propertyName = p;
      if(!/^[A-Z]/.test(propertyName)) {
        throw new Error('Model property should be in UpperCamelCase! Found: ' + propertyName);
      }
      var validator = prop.validation || function() { return true; };
      var validateFunction = prop.validation || function() { return true; };
      var filter = prop.filter || function(v) { return v; };
      var filterFunction = prop.filter || function(v) { return v; };
      var propertyType = prop.type;
      var propertyRequired = prop.required || false;
      var propertyValue = prop.default;
      if (prop.default == undefined) prop.default = null;
      var mask = typeof prop.mask == 'number' ? prop.mask || 6 : 6;
      var objectContext = {}

      //
      // Filter helper
      //
      var filterScope = { };
      filterScope.toMoney = function(v) {
        if (typeof v == 'string') return parseFloat(v).toFixed(2);
        if (typeof v == 'number') return v.toFixed(2);
      };
      filterScope.trim = function(v) {
        return v.trim();
      };
      filterScope.replace = function(v, find, replace) {
        return v.replace(find, replace);
      };
      filterScope.encode = function(v, type) {
        if (type == "json") return JSON.stringify(v);
        if (type == "base64") return new Buffer(v).toString('base64');
        if (type == "url") return encodeURIComponent(v);
      };
      filterScope.decode = function(v, type) {
        if (type == "json") return JSON.parse(v);
        if (type == "base64") return new Buffer(v, 'base64').toString('binary');
        if (type == "url") return decodeURIComponent(v);
      };
      filterScope.toUpperCase = function(v) {
        return v.toUpperCase();
      };
      filterScope.toLowerCase = function(v) {
        return v.toLowerCase();
      };
      filterScope.capitalise = function(v) {
        return v.split(" ").map(function(word) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(" ");
      };
      
      if (typeof filter != "function") {
        filterFunction = function(v) {
          filter.forEach(function(f) {
            var func = Object.keys(f)[0];
            var value = f[func];
            v = filterScope[func].apply({}, [v].concat(value)); 
          });
          return v;
        };
      }
      
      //
      // Value validations
      // 
      if (typeof validator != "function") {
        validateFunction = function(v) {
          if ((validator.regex) && !validator.regex.test(v)) {
            return false;
          }
          if ((validator.minlength) && (typeof v == 'string') && (v.length < validator.minlength)) {
            return false;
          }
          if ((validator.maxlength) && (typeof v == 'string') && (v.length > validator.maxlength)) {
            return false;
          }
          if ((validator.min) && (typeof v == 'number') && (v < validator.min)) {
            return false;
          }
          if ((validator.max) && (typeof v == 'number') && (v > validator.max)) {
            return false;
          }
          if ((validator.isIn) && (validator.isIn.indexOf(v) == -1)) {
            return false;
          }
          if ((validator.before) && (v instanceof Date) && (v > validator.before)) {
            return false;
          }
          if ((validator.after) && (v instanceof Date) && (v < validator.after)) {
            return false;
          }
          if ((validator.looksLike) && (typeof v == 'string')) {
            if ((validator.looksLike == 'email') && !((/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i).test(v))) return false;
            if ((validator.looksLike == 'postcode') && !((/[A-Za-z]{1,2}\d{1,2}\s{0,}\d[A-Za-z][A-Za-z]/).test(v))) return false;
            if ((validator.looksLike == 'money') && !((/(\d){0,}\.\d\d/).test(v))) return false;
          }
          return true;
        };
      }
      
      function validateNewValue(newValue) {
        var validType = ( (typeof newValue == propertyType) ||
                          ( (newValue instanceof Object) &&
                            (newValue.hasOwnProperty("__type")) &&
                            (newValue.__type == propertyType) ) );
        var passedValidation = validateFunction.call(obj, newValue);
        if ( (propertyType && validType && passedValidation) || passedValidation) {
          return true;
        } else {
          errors.push({
            type: propertyType,
            name: propertyName,
            from: propertyValue,
            to: newValue,
            reason: {
              validType: validType,
              passedValidation: passedValidation
            },
            trace: new Error("Error").stack
          });
          return false;
        }
      }
      
      function validateArray(array) {
        for (var i=0; i<array.length; i++) {
          if (!validateNewValue(array[i])) {
            array.splice(i, 1);
            i--;
          }
        }
        return array;
      }
      
      //
      // Getter for property
      //
      function getter() {
        if (mask & Modeler.ARRAY) {
          if (!Array.isArray(propertyValue)) propertyValue = new Array();
          var validArray = propertyValue.concat([]);
          Object.defineProperty(validArray, "pop", {
            value: function() {
              return propertyValue.pop();
            }
          });
          Object.defineProperty(validArray, "push", {
            value: function() {
              return propertyValue.push.apply(propertyValue, Array.prototype.slice.call(arguments));
            }
          });
          Object.defineProperty(validArray, "reverse", {
            value: function() {
              return propertyValue.reverse();
             }
          });
          Object.defineProperty(validArray, "shift", {
            value: function() {
              return propertyValue.shift();
            }
          });
          Object.defineProperty(validArray, "sort", {
            value: function() {
              return propertyValue.sort.apply(propertyValue, Array.prototype.slice.call(arguments));
            }
          });
          Object.defineProperty(validArray, "splice", {
            value: function() {
              return propertyValue.splice.apply(propertyValue, Array.prototype.slice.call(arguments));
            }
          });
          Object.defineProperty(validArray, "unshift", {
            value: function() {
              return propertyValue.unshift.apply(propertyValue, Array.prototype.slice.call(arguments));
            }
          });
          return validArray;
        } else {
          return propertyValue;
        }
      }
      
      //
      // Setter for property
      //
      function setter(value) {
        if (mask & Modeler.ARRAY) {
          if (!Array.isArray(value)) return;
          for (var i=0; i<value.length; i++) {
            value[i] = filterFunction.call(filterScope, (value[i]));
          }
          propertyValue = validateArray(value);
        } else {
          value = filterFunction.call(filterScope, value);
          if (validateNewValue(value)) {
            propertyValue = value;
          } 
        }
      }

      //
      // Handle Getter
      //
      if(mask & Modeler.GET) {
        objectContext.get = getter;
      } else {
        objectContext.get = function() {
          errors.push({
            type: propertyType,
            name: propertyName,
            from: propertyValue,
            to: null,
            reason: {
              get: 'Get: Permission Denied!'
            },
            trace: (new Error("Error")).stack
          });
          return null;
        }
      }

      //
      // Handle Setter
      //
      if(mask & Modeler.SET) {
        objectContext.set = setter;
      } else {
        objectContext.set = function() {
          errors.push({
            type: propertyType,
            name: propertyName,
            from: propertyValue,
            to: null,
            reason: {
              set: 'Set: Permission Denied!'
            },
            trace: new Error("Error").stack
          });
          return propertyValue;
        }
      }
    
      //
      // Handle Hidden
      //
      if(!(mask & Modeler.HIDDEN)) {
        objectContext.enumerable = true;
      }

      //
      // Set the Object property from the Json object passed in.
      //
      var jsonProperty = json[propertyName] ||
          json[propertyName.charAt(0).toLowerCase() + propertyName.slice(1)] ||
          json[propertyName.toLowerCase()];
      if (propertyRequired && 
           !( (propertyValue && (validateNewValue(propertyValue))) || 
              (jsonProperty && (validateNewValue(jsonProperty))) ) ) {
        errors.push({
          type: propertyType,
          name: propertyName,
          from: propertyValue,
          to: jsonProperty,
          reason: {
            required: "Value is required."
          },
          trace: new Error("Error").stack
        });
        fatalErrors++;
      }
      if(jsonProperty) {
        if(modelCache[propertyType]) {
          if (mask & Modeler.ARRAY) {
            var newArray = new Array();
            for (var i=0; i<jsonProperty.length; i++) {
              newArray.push(new modelCache[propertyType](jsonProperty[i]));
            }
            jsonProperty = newArray;
          } else {
            jsonProperty = new modelCache[propertyType](jsonProperty);
          }
        }
        setter(jsonProperty);
      }

      //
      // Define the property
      //
      Object.defineProperty(obj, propertyName, objectContext);

    })();
  }
  //
  // Establish our objects Class Type
  //
  Object.defineProperty(obj, "__type", {
    get: function() { return type }
  });


  //
  // Provide access to the list of internal errors/warnings
  //
  Object.defineProperty(obj, "__errors", {
    get: function() { return errors }
  });

  //
  // Prevent people from adding to instances of a Class
  //
  Object.preventExtensions(obj);
  
  if (fatalErrors) {
    var newError = new Error("Object constructor has missing 'Required' fields!");
    newError.warnings = errors;
    newError.constructedFrom = json;
    throw newError;
  }
  
  return obj;
};

Modeler.ARRAY   = 8;
Modeler.GET     = 4;
Modeler.SET     = 2;
Modeler.HIDDEN  = 1;

Modeler.register = function(model, modelName) {
  modelCache[modelName] = model;
}
