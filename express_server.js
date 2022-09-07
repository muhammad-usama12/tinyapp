const { application } = require("express");
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    return Math.random().toString(36).substring(2, 8);
}; 

//create a function that returns alpha numeric shortURL 



app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});


// app.get('/urls:id', (req, res) => {
//   const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca"};
//   res.render("urls_show", templateVars)
// });


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
if (!longURL) {
  return res.statusCode(400).send("Error: No Request Found!")
} 

const newID = generateRandomString();
urlDatabase[newID] = longURL 
console.log(urlDatabase)
res.redirect(`/urls/${newID}`)
}); 



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get('/urls:id', (req, res) => {
//   const templateVars = { id: req.params.id, longURL: "http://www.google.com" };
//   res.render("urls_show", templateVars)
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: "Hello World!" };
//   res.render("hello_world", templateVars);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
