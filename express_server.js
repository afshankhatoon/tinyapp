const express = require("express");
const app = express();
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
const bcrypt = require("bcrypt");
const {checkEmail, generateRandomString, getUsers, urlsForUser} = require("./helpers");
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
//app.use(cookieParser());
app.use(
  cookieSession({
    name: "cookieSession",
    keys: ["key1"],
  })
);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
 // if (req.cookies["user_id"]) {
  if (req.session.user_id) { 
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  //const user = getUsers(req.cookies["user_id"],users);
  const user = getUsers(req.session.user_id,users);
  if (user) {
    const urls = urlsForUser(user.id, urlDatabase);
    const templateVars = {urls: urls, user: user};
    res.render("urls_index", templateVars);
  } else {
    res
      .status(401)
      .send(
        "Unauthorized. Please login first before trying to access this page."
      );
  }
});

app.get("/urls/new", (req, res) => {
  //const user = getUsers(req.cookies["user_id"], users);
  const user = getUsers(req.session.user_id, users);
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
  let shortURL = req.params.shortURL;
  if(shortURL.substring(0,1)==':')
    shortURL = shortURL.substring(1);
  /* for(let url in urlDatabase){
    if(url===shortURL.substring(1)){
      longURL=urlDatabase[url]["longURL"];
    }
  } */ 
  //const user = req.cookies["user_id"];
  const user = req.session.user_id;
  const foundUser = getUsers(user,users);
  if(!user)
    res.status(401).send("Please login.");
  else if(!foundUser || !urlDatabase[shortURL])
    res.status(401).send("Sorry, you do not own this url.");
  else if(foundUser && user){
    const templateVars = { 
      shortURL: shortURL, 
      longURL: urlDatabase[shortURL].longURL, 
      user: user 
    };
    res.render("urls_show", templateVars);
  }
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
  urlDatabase[shortURL]={
    longURL: req.body.longURL,
    //userID: req.cookies["user_id"]
    userID: req.session.user_id
  };
  //console.log("req.body",req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  //const user = req.cookies["user_id"];
  const user = req.session.user_id;
  if(urlDatabase[shortURL].userID===user){
      delete urlDatabase[shortURL];
      res.redirect("/urls");
  } else {
    res
      .status(401)
      .send(
        "Unauthorized. Please login first before trying to access this page."
      );
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = checkEmail(email, users);
  if (!userExists) {
    res.status(403).send("Forbidden.");
  } else if (bcrypt.compareSync(password, users[userExists].password)){
    res.status(403).send("Incorrect Password.");
  } else {
    //res.cookie('user_id', userExists);
    req.session.user_id = userExists;
    res.redirect("/urls");
  }
});
//SHOULD IT REDIRECT TO URLS OR LOGIN?
app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session.user_id=null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword,10);
  if(!userEmail || !userPassword)
    res.status(400).send("Registration failed. Email and/or Password fields cannot be empty.");
  else if (checkEmail(userEmail, users)) 
    res.status(400).send("Registration failed. Email already exists. Please login.");
  else{
    users[userID]={id:userID,email:userEmail,password:userPassword};
    //res.cookie('user_id',userID);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

//CHANGE FUNCTION TO REDIRECT
app.get("/", (req, res) => {
  res.send("Hello!");
}); 

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

