const { application } = require("express");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail } = require('./helpers')
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
  res.send("Hello!");
});


app.get('/urls', (req, res) => {
  const templateVars = { user_id: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
  
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;


  urlDatabase[shortURL] = { id: shortURL, longURL: longURL, userID: req.session.user_id };
  // console.log(shortURL)
  // console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    return res.redirect(`/urls/${req.params.shortURL}`);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  
  const id = req.session.user_id;
  const activeUser = users[id];
  if (!activeUser) {
    return res.redirect("/login");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(urlDatabase)
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});


app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const activeUser = users[id];
  if (activeUser) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});


app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const activeUser = users[id];
  if (activeUser) {
    return res.redirect("/urls");
  }
  const templateVars = { user_id: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send(`This ID does not exist.\n`);
  }
  if (!req.session.user_id) {
    return res.status(403).send(`User must register, then login.\n`);
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send(`User does not own this URL.\n`);
  }
  
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;

  res.redirect(`/urls`);

//   let longURL = req.body.longURL;
//   urlDatabase[req.params.shortURL] = longURL;
//   res.redirect(`/urls/${req.params.shortURL}`);
// })
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

    if (email == "" || email == null || password == "" || password == null) {
      return res.status(400).send('Error: Email and Password cannot be empty');
    }
    if (getUserByEmail(email, users)) {
      return res.status(400).send('Error: Email already exists in the database');
    }
    
  const randomId = generateRandomString();
  users[randomId] = { 
    id: randomId,
    email: email,
    password: hashedPassword 
  }
  req.session.user_id = randomId;
  console.log(randomId);
  console.log(users);
  res.redirect("/urls"); // redirects back to urls
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userCheck = getUserByEmail(email, users);
  const passwordCheck = bcrypt.compareSync(req.body.password, userCheck.password);

  console.log(users);
  if (!userCheck) {
    return res.status(403).send('Email not found');
  } 
  if (!passwordCheck) {
    return res.status(403).send('Incorrect password, please try again');
  }
  req.session.user_id = userCheck.id
  res.redirect('/urls');
});



app.post("/logout", (req, res) => {
req.session = null;
  //destroys the current session upon logout
  res.redirect('/urls');
});


app.post("/urls/:shortURL/delete", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send(`This ID does not exist\n`);
  }
  if (!req.session.user_id) {
    return res.status(403).send(`User must register, then login.\n`);
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send(`User does not own this URL\n`);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});