function checkEmail(email, users) {
  for (key in users) {
    if (email === users[key].email) {
      return key;
    }
  }
}

function generateRandomString(){
  return Math.random().toString(36).substr(2, 6);
}

function getUsers(user_id,users){
  return users[user_id];
}

module.exports = {checkEmail, getUsers, generateRandomString};