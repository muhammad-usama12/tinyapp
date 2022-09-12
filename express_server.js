const { application } = require("express");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser} = require('./helpers')
const app = express();
const PORT = 8080;
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.use(cookieSession({  
  name: 'session',
  keys: ['heisenberg'],

// Cookie Options
maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!user) {
    res.redirect('/login')
  } else {
    res.redirect('/urls')
  }
});

app.get('/urls', (req, res) => {
  const currentUser = req.session.user_id
  const user = users[currentUser];
  const templateVars = { user_id: user, urls: urlsForUser(currentUser, urlDatabase) };
  res.render("urls_index", templateVars); 
});

app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!currentUser) {
  res.redirect("/login");
  } else { 
  const templateVars = { user_id: user };
  res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (!user) {
    res.redirect("/login")
  } else {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = { id: id, longURL: longURL, userID: req.session.user_id };
  // console.log(id)
  // console.log(urlDatabase)
  res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/:id", (req, res) => {
  currentUser = req.session.user_id;
  user = users[currentUser];
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (user === urlDatabase[id]) {
    res.status(403).send(`This id isn't yours.\n`);
  } else {
  const templateVars = { user_id: users[currentUser], id, longURL: longURL };
  res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const id = urlDatabase[req.params.id];
  if (!id) {
    return res.redirect(`/urls/${req.params.id}`);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/edit", (req, res) => {
currentUser = req.session.user_id
  user = users[currentUser];
  if (!user) {
    res.send("This id doesn't belong to you, please register and login")
  } else {
  urlDatabase[req.params.id].longURL = req.body.longURL
  res.redirect('/urls');
   }
});

app.post("/urls/:id/delete", (req, res) => {

  currentUser = req.session.user_id
  user = users[currentUser];
  if (!user) {
    res.send("This id doesn't belong to you, please register and login")
  } else { 
    delete urlDatabase[req.params.id];
  res.redirect('/urls');
  }
});

app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (user) {
    res.redirect("/urls");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

    if (email == "" || email == null || password == "" || password == null) {
      res.status(400).send('Error: Email and Password cannot be empty');
    }
    if (getUserByEmail(email, users)) {
      res.status(400).send('Error: Email already exists in the database');
    }
    
  const newID = generateRandomString();
  users[newID] = { 
    id: newID,
    email: email,
    password: hashedPassword 
  }
  req.session.user_id = newID;
  // console.log(newID);
  // console.log(users);
  res.redirect("/urls"); // redirects back to urls
});

app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;
  const user = users[currentUser];
  if (user) {
  res.redirect("/urls");
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
    res.status(403).send('Email not found');
  } 
  if (bcrypt.compareSync(passwordUsed, userCheck.password)) {
    res.status(403).send('Incorrect password, please try again');
  } else {
  req.session.user_id = userCheck.id
  res.redirect("/urls")
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
    //destroys the current session upon logout
    res.redirect('/urls');
  });