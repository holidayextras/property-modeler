"use strict";
var assert = require('assert');
var util = require('util');
var Person = require('./Person');
var Address = require('./Address');

//
// Confirm my understanding of Array functions:
//
var testArray = [];
assert.equal(testArray.length, 0);
testArray.push("Test");
assert.equal(testArray.length, 1);
assert.equal(testArray[0], "Test");

//
// Define a new Person
//
var personA = new Person();
personA.Title = "Mr";
personA.FirstName = "  test ";
personA.LastName = "  testing ";
personA.Locations.push(new Address({ 
  street: 'Ashford Road', 
  town: 'Hythe', 
  county: 'Kent', 
  postcode: 'CT21 4JF' 
}));
personA.Locations[0].doubleUpStreet();
personA.Expenses = ["105", "101.0", "106.00", 103, 104.0, 100.00];
personA.Expenses.push("102.99");
personA.Expenses.sort();

//
// Check our new Person's properties
//
assert.ok(personA instanceof Person);
assert.equal(personA.getFullName(), "Mr Test Testing");
assert.equal(personA.Locations.length, 1, "Person should have 1 address");
assert.ok(personA.Locations[0] instanceof Address, "Address should be an instance of Address");
assert.equal(personA.Locations[0].toString(), "ASHFORD ROADASHFORD ROAD, hythe, Kent, CT21 4JF", "Address should be correct");
assert.equal(personA.Expenses.length, 7, "Person should have 7 expenses");
assert.deepEqual(personA.Expenses, ['100.00', '101.00', '102.99', '103.00', '104.00', '105.00', '106.00'], "Expenses should be in order");

//
// Play with our Person's Date of Birth
//
personA.DoB = new Date(1066, 6, 29);
assert.ok(typeof personA.DoB == "undefined");
personA.DoB = new Date(2066, 6, 29);
assert.ok(typeof personA.DoB == "undefined");
personA.DoB = new Date(1966, 6, 29);
assert.equal(personA.DoB.toString(), new Date(1966, 6, 29).toString());

//
// Create another Address for our Person
//
var secondAddress;
var failed = 0;
try {
  secondAddress = new Address();
} catch(e) {
  failed++;
  //console.log(e);
}
secondAddress = new Address({ Postcode: "CT21 4JF" });
secondAddress.Street = "Fake Street";
secondAddress.Town = "Faketown";
secondAddress.County = "Fakounty";
secondAddress.Postcode = "CT22 5FG";
personA.addAddress(secondAddress);

//
// Check out new Person has taken the new Address
//
assert.equal(personA.Locations.length, 2, "PersonA should have two addresses");
assert.ok(personA.Locations[1] instanceof Address, "PersonA's first address should be an Address");
assert.equal(personA.Locations[1].toString(), "FAKE STREET, faketown, Fakounty, CT22 5FG", "Address should be correct");
assert.equal(failed, 1, "Failing to provide valid required properties should throw an error");

//
// Define another Person to be NextOfKin
//
var personB = new Person({ 
  title: "Mrs", 
  firstname: "Elle", 
  lastname: "Somebody" 
});
var thirdAddress = new Address({ 
  street: "street", 
  town: "town", 
  postcode: "CT16 9QS" 
});
personB.addAddress(thirdAddress);

//
// Check the properties
//
assert.ok(personB instanceof Person, "NextOfKin should be instanceof Person");
assert.equal(personB.getFullName(), "Mrs Elle Somebody", "Name should be correct");
assert.equal(personB.Locations.length, 1, "They should have 1 address");
assert.ok(personB.Locations[0] instanceof Address, "Address should be instanceof Address");
assert.equal(personB.Locations[0].toString(), "STREET, town, , CT16 9QS");

//
// Assign the NextOfKin and check
//
personA.NextOfKin = personB;
assert.ok(personA.NextOfKin instanceof Person, "PersonA's NoK should be instance of Person");
assert.equal(personA.NextOfKin.getFullName(), "Mrs Elle Somebody", "PersonA's NoK's Name should be correct");
assert.equal(personA.NextOfKin.Locations[0].toString(), "STREET, town, , CT16 9QS", "PersonA's NoK's Address should be correct");

//
// Convert our first Person to JSON and back again
// 
var stringy = JSON.stringify(personA);
var jsonObject = JSON.parse(stringy);

//
// Recreate the Person from the JSON object, check they're 
// identical to the original Person
//
var personC = new Person(jsonObject);
//console.log("Person A:", JSON.stringify(personA, null, 2), personA.__errors, personA.__type, util.inspect(personA, true, null));
//console.log("Person C:", JSON.stringify(personC, null, 2), personC.__errors, personC.__type, util.inspect(personA, true, null));
assert.equal(JSON.stringify(personA, null, 2), JSON.stringify(personC, null, 2), "Constructor should recreate objects");
//assert.deepEqual(personA, personC, "Constructor should completely reconstruct all child objects");








