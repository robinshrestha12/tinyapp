const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); //make data readable by middleware body-parser
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(bodyParser.urlencoded({extended: true}));
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
  const templateVars = {urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => { //short Url with full url redirect
  if (urlDatabase[req.params.shortURL]) {
    const fullLongURL = urlDatabase[req.params.shortURL];
    res.redirect(fullLongURL);
  } else {
    res.sendStatus(404);
  }
});
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
app.post("/urls", (req, res) => {
  const rndShort = generateRandomString(); //generating random alphaneumeric string
  urlDatabase[rndShort] =  req.body.longURL; //setting new long url with key
  res.redirect(`/urls/${rndShort}`); //redirecting to short URL
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
