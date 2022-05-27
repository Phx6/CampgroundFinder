const express = require("express")
const router = express.Router()
const catchAsync = require("../utilities/catchAsync")
const User = require("../models/user")
const passport = require("passport")
const session = require("express-session")

const auth = require("../controllers/auth")

router.route("/register")
    .get(auth.registerpage)
    .post(catchAsync(auth.register))

router.route("/login")
    .get(auth.loginpage)
    //this is where the passport magic happens, all the authentification is built in passport.authenticate. no need to add anything else then that and its parameters
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), auth.login)

router.get("/logout", auth.logout)

module.exports = router;