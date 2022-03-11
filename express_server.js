const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //make data readable by middleware body-parser
const req = require("express/lib/request");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {getUserByemail, urlsForUser} = require("./helper");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["1234"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
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
  if (!req.session["user_id"]) { // if user is not logged in.
    return res.status(403).send(`Please log in to view the list <a href="/login"> Go Login</a>`);
  }
  const userId = req.session["user_id"];
  const user = users[userId];
  const newUrlDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { //defining a new object
    urls: newUrlDatabase,
    user: userId ? user : null,
  }; //object item user added to show in webpage
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) { //if user is  not logged in
    res.redirect("/login");
    return;
  }
  const userId = req.session["user_id"];
  const user = users[userId];
  res.render("urls_new", { user }); //object user is passed while rendering to show
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.session["user_id"]] };
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
  if (req.session["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = { user: null }; //user is set null when the registration page opens
  res.render("urls_registration", templateVars);
});
app.get("/login", (req, res) => {

  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null }; //user is set null when the registration page opens
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]) { //if shortURL object is present
    if (users[req.session["user_id"]]) { //if user is logged in
      const shortUrlData = urlDatabase[req.params.shortURL];
      if (shortUrlData["userID"] === req.session["user_id"]) { //if userid matches with the id of database object
        delete urlDatabase[req.params.shortURL]; //deleting the url database.
        res.redirect(`/urls/`); //redirecting to short URL
      } else {
        res.status(403).send(`403: You do not have access to delete this URL .`);
      }
    } else {
      res.status(403).send(`403: Please log in to delete URL. <a href="/login"> Go to Login Page</a> `);
    }
  } else {
    res.status(403).send(`403: No url in the db please check, <a href="/login"> Go to Login Page</a>`);
  }
});
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) { //if shortURL object is present
    if (users[req.session["user_id"]]) { //if user is logged in
      const shortUrlData = urlDatabase[req.params.shortURL];
      if (shortUrlData["userID"] === req.session["user_id"]) { //if userid matches with the id of database object
        urlDatabase[req.params.shortURL]["longURL"] = req.body.newURL;
        res.redirect(`/urls/`); //redirecting to short URL
      } else {
        res.status(403).send(`403: You do not have access to edit this URL. `);
      }
    } else {
      res.status(403).send(`403: Please log in to edit URL.<a href="/login"> Go to Login Page</a> `);
    }
  } else {
    res.status(403).send(`403: No url in the db please check, <a href="/login"> Go to Login Page</a>`);
  }
});
app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    console.log("You must be logged in to create a short URL");
    res.redirect("/url");
    return;
  }
  const rndShort = generateRandomString(); //generating random alphaneumeric string
  urlDatabase[rndShort] = { "longURL": req.body.longURL, "userID": req.session["user_id"] }; //setting new long url with key value
  res.redirect(`/urls/${rndShort}`); //redirecting to short URL
});
app.post("/login", (req, res) => { //login part
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const user = getUserByemail(userEmail, users);
  if (user) { //return user or undefined.
    if (bcrypt.compareSync(userPassword, user.password)) {
      req.session['user_id'] = user.id; //saving userid in cookie
      res.redirect("/urls");
    } else {
      return res.status(403).send("403: Password does not match.");
    }
  } else {
    return res.status(403).send("403: User email does not exists.");
  }
});
app.post("/logout", (req, res) => { //logout part
  req.session = null; //clearing cookie session after logout
  res.redirect("/urls");
});
app.post("/register", (req, res) => {
  const id = generateRandomString();
  if (!getUserByemail(req.body.email, users)) { //if email is already there
    if (req.body.email && req.body.password) {
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      users[id] = { // setting new user
        id: id,
        email: req.body.email,
        password: hashedPassword
      };
      req.session["user_id"] = id; //setting cookie
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
