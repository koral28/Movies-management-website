var express = require("express");
var router = express.Router();
const moviesDal = require("../models/moviesDal");
const restApiDal = require("../models/restApiDal");
const usersDal = require("../models/usersDal");
const { compile } = require("morgan");

router.get("/", function (req, res, next) {
  if (!req.session.authenticated) {
    res.redirect("/");
  } else {
    res.render("menu", { title: "Menu", admin: req.session.admin });
  }
});

/////////////////////////////////////USER MANAGEMENT//////////////////////////////////////////////////////
router.get("/usersManagement", async function (req, res, next) {
  let usersName = await usersDal
    .getUsersData()
    .catch((err) => console.log("caught it"));
  res.render("usersManagement", {
    title: "Users Management Page",
    usersName: usersName.users,
  });
});

router.get("/usersDataAddNew", function (req, res, next) {
  res.render("usersDataAddNew", {
    title: "Users Data Add New Page",
  });
});

router.get("/usersDataUpdate/:userName", async function (req, res, next) {
  let userDetails = {
    userName: req.session.userName,
    password: req.session.password,
    CreatedDate: req.session.date,
    NumofTransactions: req.session.maxTransactions,
  };
  res.render("userDataUpdate", {
    title: "Users Data Update Page",
    userDetails: userDetails,
  });
});

router.get("/addUser", async function (req, res, next) {
  let users = await usersDal
    .getUsersData()
    .catch((err) => console.log("caught it"));
  let originalUsersObj = users.users;
  let newUser = {
    Username: req.query.userName,
    Password: req.query.Password,
    CreatedDate: new Date().toISOString().slice(0, 10),
    NumofTransactions: req.query.NumofTransactions,
  };

  //console.log(newUser);
  originalUsersObj.push(newUser);
  let result = await usersDal
    .writeUsersData({ users: originalUsersObj })
    .catch((err) => console.log("caught it"));
  if (result == "Succeeded") {
    res.render("menu", { title: "Menu Page", admin: req.session.admin });
  } else {
    res.redirect("/usersManagement");
  }
});

router.get("/delete/:userName", async function (req, res, next) {
  let users = await usersDal
    .getUsersData()
    .catch((err) => console.log("caught it"));
  let originalUsersObj = users.users;

  let newUsersArray = originalUsersObj.filter(
    (x) => x.Username != req.params.userName
  );

  if (newUsersArray.length != originalUsersObj.length) {
    let result = await usersDal
      .writeUsersData({ users: newUsersArray })
      .catch((err) => console.log("caught it"));
    if (result == "Succeeded") {
      res.render("menu", { title: "Menu Page", admin: req.session.admin });
    } else {
      res.redirect("/");
    }
  }
});

/////////////////////////////////////MOVIES MANAGEMENT//////////////////////////////////////////////////////
router.get("/createNewMovie", async function (req, res, next) {
  let flag = 0;
  req.session.currTransactions += 1;
  //console.log("the user did " + req.session.currTransactions + " transactions");

  if (req.session.currTransactions > req.session.maxTransactions) {
    flag = 1;
  } else {
    flag = 0;
  }

  if (flag) {
    res.render("noCreditsLeft", {
      title: "Sorry, you don't have enough credits!",
    });
  } else {
    res.render("createNewMovie", { title: "Create new movie" });
  }
});

router.get("/searchMovies", function (req, res, next) {
  let flag = 0;
  req.session.currTransactions += 1;
  //console.log("the user did " + req.session.currTransactions + " transactions");

  if (req.session.currTransactions > req.session.maxTransactions) {
    flag = 1;
  } else {
    flag = 0;
  }

  if (flag) {
    res.render("noCreditsLeft", {
      title: "Sorry, you don't have enough credits!",
    });
  } else {
    res.render("searchMovies", { title: "Search movie" });
  }
});

router.get("/movieData/:movieName", async function (req, res, next) {
  let movieID;
  let movieName = req.params.movieName;
  let movieGenre = [];
  let movieLanguage;
  let moviePicture;

  let movies = await restApiDal
    .getData()
    .catch((err) => console.log("caught it"));
  movies = movies.data;

  for (var i = 0; i < movies.length; i++) {
    if (movieName == movies[i].name) {
      movieLanguage = movies[i].language;
      movieID = movies[i].id;
      moviePicture = movies[i].image.medium;
      for (var j = 0; j < movies[i].genres.length; j++) {
        movieGenre.push(movies[i].genres[j]);
      }
    }
  }

  let movieDetails = {
    ID: movieID,
    movieName: req.params.movieName,
    movieGenres: movieGenre,
    movieLanguage: movieLanguage,
    moviePicutre: moviePicture,
  };

  let flag = 0;
  req.session.currTransactions += 1;
  //console.log("the user did " + req.session.currTransactions + " transactions");

  if (req.session.currTransactions > req.session.maxTransactions) {
    flag = 1;
  } else {
    flag = 0;
  }

  if (flag) {
    res.render("noCreditsLeft", {
      title: "Sorry, you don't have enough credits!",
    });
  } else {
    res.render("movieData", {
      title: "Movie data page",
      movieData: movieDetails,
    });
  }
});

router.get("/saveNewMovie", async function (req, res, next) {
  //read the curr file
  let fileData = await moviesDal
    .readCurrentMovie()
    .catch((err) => console.log("caught it"));
  let restApiData = await restApiDal
    .getData()
    .catch((err) => console.log("caught it"));
  let restApi = restApiData.data;
  let id = 0;

  //if the movies file is empty we take the next id from api else from the file id +1
  if (fileData.movies.length == 0) {
    id = restApi[restApi.length - 1].id + 1;
  } else {
    id = fileData.movies[fileData.movies.length - 1].id + 1;
  }

  let movieObj = {
    id: id,
    movieName: req.query.moviename,
    movieLanguage: req.query.language,
    genres: req.query.genres,
  };

  //write the currr file
  fileData.movies.push(movieObj);
  //write the whole movies data back to the json file
  let result = await moviesDal
    .writeNewMovie(fileData)
    .catch((err) => console.log("caught it"));
  if (result == "Succeedded") {
    res.redirect("/menu");
  } else {
    res.redirect("/login");
  }
});

router.get("/searchResults", async function (req, res, next) {
  let movies = await restApiDal
    .getData()
    .catch((err) => console.log("caught it"));
  movies = movies.data;
  let sameGenreMoviesNames = [];
  for (var i = 0; i < movies.length; i++) {
    for (var j = 0; j < movies[i].genres.length; j++) {
      if (req.query.genre == movies[i].genres[j]) {
        sameGenreMoviesNames.push(movies[i].name);
      }
    }
  }
  res.render("searchResults", {
    title: "Search Results",
    movieName: req.query.moviename,
    sameGenreMoviesNames: sameGenreMoviesNames,
  });
});

module.exports = router;
