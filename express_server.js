const { application } = require("express");
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

function generateRandomString() {
    return Math.random().toString(36).substring(2, 8);
}; 

const getUserByEmail = (userEmail, userDB) => {
  for (let key in userDB) {
    if (userDB[key].email === userEmail) {
      return userDB[key]
    }
  } 
  return null; 
}; 



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars)
});


app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = {shortURL: req.params.shortURL, longURL, user: users[res.cookie["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
const longURL = urlDatabase[req.params.shortURL]
res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  const emailUsed = req.body['email']; 
  const passwordUsed = req.body['password']; 
  const usersCheck = getUserByEmail(emailUsed, users);
  if (!usersCheck) {
   return res.status(403).send('Email not found')
  }
  if (usersCheck.password !== passwordUsed) {
  return res.status(403).send('Incorrect password')
  }
  res.cookie('user_id', usersCheck.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  //clears previous user cookies (reset for new login info) 
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
if (email == "" || email == null || password == "" || password == null) {
  return res.status(400).send('Error: Email and Password cannot be empty')
} 
if (getUserByEmail(email, users)) {
  return res.status(400).send('Error: Email already exists in the database')  
}

  const randomId = generateRandomString(); // generate a random user id
// user_id containing cookie containing user's newly generated id!! 
// const { email, password } = req.body;
users[randomId]= { id: randomId, email, password }
res.cookie(`user_id`, randomId)
console.log(randomId)
res.redirect("/urls"); // redirects back to urls 
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
if (!longURL) {
  return res.statusCode(400).send("Error! No Request Found")
} 

const shortURL = generateRandomString();
urlDatabase[shortURL] = longURL 
console.log(urlDatabase)
res.redirect(`/urls/${shortURL}`)
}); 

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect('/urls');
});

// function validateCookie(req, res, next) {
//   const { cookies } = req;
//   if ('username' in cookies) {
//     console.log('username exists.')
//     if (cookies.username === username) next(); 
//     else res.status(403).send({ msg: 'Not Authenticated' });
//   } res.status(403).send({ msg: 'Not Authenticated' });
// }
