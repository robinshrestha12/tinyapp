const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //make data readable by middleware body-parser
const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
app.set("view engine", "ejs");


const urlDatabase = { //database with userID
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@x.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const emailLookup = function(inputEmail) {//function to check if email already exists
  for (let key in users)
    if (users[key]["email"] === inputEmail.trim()) {
      return true;
    }
  return false;
};
const passwordLookup = function(inputPassword) {//function to check if email already exists
  for (let key in users)
    if (users[key]["password"] === inputPassword) {
      return true;
    }
  return false;
};
const userIdLookup = function(inputEmail, inputPassword) {//function to check if email & password already exists
  for (let key in users)
    if (users[key]["email"] === inputEmail && users[key]["password"] === inputPassword) {
      return users[key]["id"];
    }
  return false;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const generateRandomString = function() { //random alphanumeric characeters generation
  let rndString = '';
  let gvnStrng = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    rndString += gvnStrng.charAt(Math.floor(Math.random() * gvnStrng.length));
  }
  return rndString;
};
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {urls: urlDatabase,
    user: user
  }; //object item user added to show in webpage
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
    return;
  }
  const userId = req.cookies["user_id"];
  const user = users[userId];
  res.render("urls_new", {user}); //object user is passed while rendering to show
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => { //short Url with full url redirect
  if (urlDatabase[req.params.shortURL]) {
    const fullLongURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(fullLongURL);
  } else {
    res.sendStatus(404);
  }
});
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = { user: null}; //user is set null when the registration page opens
  res.render("urls_registration", templateVars);
});
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = { user: null}; //user is set null when the registration page opens
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; //deleting the url database.
  res.redirect(`/urls/`); //redirecting to short URL
});
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.newURL; //saving new value from edit
  res.redirect(`/urls/`); //redirecting to short URL
});
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    console.log("You must be logged in to create a short URL");
    res.redirect("/url");
    return;
  }
  const rndShort = generateRandomString(); //generating random alphaneumeric string
  urlDatabase[rndShort] =  { "longURL": req.body.longURL, "userID": req.cookies["user_id"]}; //setting new long url with key value
  res.redirect(`/urls/${rndShort}`); //redirecting to short URL
});
app.post("/login",(req, res) => { //login part
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (emailLookup(userEmail) === false) {
    //res.sendStatus("403", 403);
    return res.status(403).send("403: User does not exists.");
  }
  if (passwordLookup(userPassword) === false) {
    return res.status(403).send("403: Password does not match.");
  }
  if (userIdLookup(userEmail, userPassword)) { //validating if email and password exists
    res.cookie('user_id', userIdLookup(userEmail, userPassword)); //saving userid in cookie
    res.redirect("/urls");
  }
});
app.post("/logout",(req, res) => { //logout part
  res.clearCookie('user_id'); //clearing cookie after logout
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  if (emailLookup(req.body.email) === false) { //if email is already there
    if (req.body.email && req.body.password) {
      users[id] = { // setting new user
        id: id,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie("user_id", id); //setting cookie
      res.redirect("/urls");
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
