var express = require("express");
var router = express.Router();
const usersDal = require("../models/usersDal");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("login", { title: "Login" });
});

router.get("/usersDetails", async function (req, res, next) {
  let result = 0;
  let usersData = await usersDal
    .getUsersData()
    .catch((err) => console.log("caught it"));
  let mySession = req.session;
  if (!mySession.counter) {
    mySession.maxTransactions = 0;
    mySession.currTransactions = 0;
    mySession.date = new Date().toISOString().slice(0, 10);
    mySession.userName = "";
    //console.log(mySession.todayDate);
    if (
      req.query.username == usersData.users[0].Username &&
      req.query.password == "1234"
    ) {
      mySession.admin = "admin";
    } else {
      mySession.admin = "user";
    }
  } else {
    if (req.query.username == "Koral Levi" && req.query.password == "1234") {
      mySession.admin = "admin";
    } else {
      mySession.admin = "user";
    }
  }

  //console.log(mySession.admin);
  //check if user is in the json and has credits (Num Of Transactions)
  for (var i = 0; i < usersData.users.length; i++) {
    if (
      usersData.users[i].Username == req.query.username &&
      usersData.users[i].Password == req.query.password &&
      usersData.users[i].NumofTransactions + 1 > mySession.currTransactions
    ) {
      mySession.maxTransactions = usersData.users[i].NumofTransactions;
      mySession.userName = usersData.users[i].Username;
      mySession.password = usersData.users[i].Password;
      //console.log(mySession.maxTransactions);
      result = 1;
    }
  }

  if (result == 1) {
    mySession.authenticated = true;
    res.render("menu", { title: "Menu Page", admin: req.session.admin });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
