const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};



const getUserByEmail = function(userEmail, userDB) {
  for (let key in userDB) {
    if (userEmail === userDB[key].email) {
      return userDB[key];
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  let currentUserID = id;
  let usersURL = {};
  for (let key in database) {
    if (database[key].userID === currentUserID) {
      usersURL[key] = database[key];
    }
  }
  return usersURL;
};

module.exports = {
  generateRandomString, 
  getUserByEmail,
  urlsForUser
}