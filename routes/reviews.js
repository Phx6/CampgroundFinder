const express = require("express")
//mergeParams: true is used to make sure that the params taken from the app.js come through review and campground routes
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campgrounds")
const Review = require("../models/review")

const catchAsync = require("../utilities/catchAsync");

const reviews = require("../controllers/reviews")

const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware")




router.post("/", isLoggedIn, validateReview, catchAsync(reviews.post))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.delete))

module.exports = router
