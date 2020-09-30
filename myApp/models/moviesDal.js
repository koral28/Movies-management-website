const jsonfile = require("jsonfile");

exports.writeNewMovie = function (obj) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(__dirname + "/NewMovies.json", obj, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("Succeedded");
      }
    });
  });
};

exports.readCurrentMovie = function () {
  return new Promise((resolve, reject) => {
    jsonfile.readFile(__dirname + "/NewMovies.json", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
