
const getUserByEmail = function(inputEmail, inputDatabase) {//function to get user object by email
  for (let key in inputDatabase) {
    if (inputDatabase[key]["email"] === inputEmail) {
      return key;
    }
  }
  return null;
};
const urlsForUser = function(id, urlDatabase) { //function getting new object having same ids
  let newUrlDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      newUrlDatabase[key] = urlDatabase[key];
    }
  }
  return newUrlDatabase;
};

module.exports = { getUserByEmail, urlsForUser };
