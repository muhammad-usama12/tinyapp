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


module.exports = {
  generateRandomString, 
  getUserByEmail
}