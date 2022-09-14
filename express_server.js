const { application } = require("express");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const { users, urlDatabase } = require('./database')
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.use(cookieSession({ //encrypts cookie session 
  name: 'session',
  keys: ['heisenberg'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!user) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => { //retrieves myURLs page if user is registered and logged in
  const currentUser = req.session.user_id;
  if (!currentUser) {
    return res.status(400).send("Error 400: Bad Request - User must register and login\n") 
  } else {
  const user = users[currentUser];
  const templateVars = { user_id: user, urls: urlsForUser(currentUser, urlDatabase) };
  res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!user) {
      return res.status(400).send("Error 400: Bad Request - User must register and login before adding new URLs\n")
    } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = { id: id, longURL: longURL, userID: req.session.user_id };
    return res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!currentUser) {
    return res.redirect("/login");
  } else {
    const templateVars = { user_id: user };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const currentUser = req.session.user_id;
  const id = req.params.id;
  userUrls = urlsForUser(currentUser, urlDatabase)

  if (!currentUser) { 
    return res.status(400).send("Error 400: Bad Request - User must login first\n")
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: Bad Request - This URL ID doesn't exist\n")
  }
  if (currentUser && !urlDatabase[id][currentUser] && !userUrls[id]) {
    return res.status(401).send("Error 401: Unauthorized\n")
  } else {
    const id = req.params.id;
    const longURL = urlDatabase[id].longURL;
    const templateVars = { user_id: users[currentUser], id, longURL: longURL };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
   if (!urlDatabase[id]) {
    return res.status(404).send("Error 404: Not Found - This URL ID doesn't exist\n")
   } else {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
   }
});

app.post("/urls/:id/edit", (req, res) => {
  currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!user) {
   return res.status(400).send("Error 400: Bad Request - This ID doesn't belong to you, please register and login\n") 
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  let id = req.params.id;
  if (!user) {
    return res.status(400).send("Error 400: Bad Request - This ID doesn't belong to you, cannot be deleted\n")
    } else {
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
   return res.status(403).send('Error 403: Forbidden - Email and Password cannot be empty\n');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Error 400: Bad Request - Email already exists in the database\n");
  }
    
  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = newID;
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (user) {
   return res.redirect("/urls");
  } else {
    const templateVars = {user_id: user };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const emailUsed = req.body.email;
  const passwordUsed = req.body.password;
  const userCheck = getUserByEmail(emailUsed, users);

  if (!userCheck) {
    return res.status(403).send("Error 403: Forbidden - Email not found\n");
  }
  if (!bcrypt.compareSync(passwordUsed, userCheck.password)) {
   return res.status(403).send("Error 403: Forbidden - Incorrect password, please try again\n");
  } else {
    req.session.user_id = userCheck.id;
   return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => { // logs current user out and negates cookie session
  req.session = null;
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});