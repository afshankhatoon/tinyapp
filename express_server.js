const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
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
}

function generateRandomString(){
    return Math.random().toString(36).substr(2, 6);
}

/* app.get("/", (req, res) => {
  res.send("Hello!");
}); */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

function getUsers(user_id){
  return users[user_id];
}

app.get("/urls", (req, res) => {
  //console.log(req);
  const user = getUsers(req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = getUsers(req.session["user_id"], users);
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL.substring(1)];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let longURL;
  let shortURL = req.params.shortURL;
  for(let url in urlDatabase){
    if(url===shortURL.substring(1)){
      longURL=urlDatabase[url];
    }
  }
  const user = getUsers(req.cookies["user_id"]);
  const templateVars = { shortURL: shortURL, longURL: longURL, user: user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=req.body.longURL;
  console.log("req.body",req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.body);

  const shortURL = req.params.shortURL;
  const obj = urlDatabase[shortURL];

  console.log("obj", obj);

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log("req.body",req.body);  
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("loginForm", { user: null });
});

app.post("/login", (req, res) => {
  res.cookie('user_id',true);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  
  //const user = getUsers(req.session["user_id"], users);
  const templateVars = {user: null};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  users[userID]={id:userID,email:userEmail,password:userPassword};
  console.log(users);
  res.cookie('user_id',userID);
  res.redirect("/urls");
});