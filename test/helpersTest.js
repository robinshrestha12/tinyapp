const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require("../helper"); //importing the functions

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const testUrlDatabase = { //database with userID
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "abcde"
  }
};
describe('getUserByEmail', function() {
  it('should return a user with valid email "user@example.com" ', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return a user with valid email "user2@example.com" ', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserID = "user2RandomID";
    assert.equal(user, expectedUserID);
  });
});
describe('urlsForUser', function() {
  it('should return an object with valid id "aJ48lW"', function() {
    const user = urlsForUser("aJ48lW",testUrlDatabase);
    const expectedUser =  { b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' } };
    assert.deepEqual(user, expectedUser);
  });
  it('should return an object with valid id "abcde"', function() {
    const user = urlsForUser("abcde", testUrlDatabase);
    const expectedUser =  {  i3BoGr: { longURL: "https://www.google.ca", userID: "abcde" } };
    assert.deepEqual(user, expectedUser);
  });

});