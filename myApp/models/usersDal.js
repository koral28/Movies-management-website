const jsonfile = require("jsonfile");

exports.getUsersData = function () {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(__dirname + "/Users.json", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.writeUsersData = function (users) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(__dirname + "/Users.json", users, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("Succeeded");
      }
    });
  });
};
