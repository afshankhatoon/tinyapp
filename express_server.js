const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const {checkEmail, generateRandomString, getUsers} = require("./helpers");
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const bodyParser = require("body-parser");
const users = { 
  userRandomID: {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 user2RandomID: {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = getUsers(req.cookies["user_id"],users);
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUsers(req.cookies["user_id"], users);
  const templateVars = {user: user};
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL.substring(1);
  //const longURL = urlDatabase[shortURL.substring(1)];
  const longURL = urlDatabase[shortURL]["longURL"];
  if (!longURL) 
    res.status(404).send();
  else 
    res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let longURL;
  let shortURL = req.params.shortURL;
  for(let url in urlDatabase){
    if(url===shortURL){
      longURL=urlDatabase[url]["longURL"];
    }
  }
  const user = getUsers(req.cookies["user_id"],users);
  const templateVars = { shortURL: shortURL, longURL: longURL, user: user };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  res.render("loginForm", { user: null });
});

app.get("/register", (req, res) => {
  //const user = getUsers(req.session["user_id"], users);
  const templateVars = {user: null};
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=req.body.longURL;
  //console.log("req.body",req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const obj = urlDatabase[shortURL];
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = checkEmail(email, users);
  if (!userExists) {
    res.status(403).send("Forbidden.");
  } else if (password !== users[userExists].password) {
    res.status(403).send("Incorrect Password.");
  } else {
    res.cookie('user_id', userExists);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if(!userEmail || !userPassword)
    res.status(400).send("Registration failed. Email and/or Password fields cannot be empty.");
  else if (checkEmail(userEmail, users)) 
    res.status(400).send("Registration failed. Email already exists. Please login.");
  else{
    users[userID]={id:userID,email:userEmail,password:userPassword};
    res.cookie('user_id',userID);
    res.redirect("/urls");
  }
});

/* app.get("/", (req, res) => {
  res.send("Hello!");
}); */

/* app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
 */

 /* app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 }); */

 /*  app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
 */

