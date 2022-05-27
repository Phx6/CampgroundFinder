const express = require("express")
//mergeParams: true is used to make sure that the params taken from the app.js come through review and campground routes
const router = express.Router();

const catchAsync = require("../utilities/catchAsync");

const Campground = require("../models/campgrounds")

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")

const campgrounds = require("../controllers/campgrounds")
const { storage } = require("../cloudinary")
const multer = require("multer")
const upload = multer({ storage })



//all of our routes logic have been moved to controllers. so our code looks WAAY cleaner here

//we also now group all route having the same path together
//**previously it was router.get("/", catchAsync(campgrounds.index)) */
router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.create))


//isLoggedIn is a middleware we create to authenticate someone (see middleware.js)
router.get("/new", isLoggedIn, campgrounds.new)


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.edit))

router.route("/:id")
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete))
    .get(catchAsync(campgrounds.show))


module.exports = router