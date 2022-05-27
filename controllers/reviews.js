const Campground = require("../models/campgrounds")
const Review = require("../models/review")

module.exports.post = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    foundCamp.reviews.push(review);
    await review.save()
    await foundCamp.save()
    req.flash("success", `Review Created on ${foundCamp.title}!`)
    res.redirect(`/campgrounds/${foundCamp._id}`)
}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params
    //the $pull action is a method from mongo allowing me to take something out of an array (here we find the review id, and use it to remove the review itself from a campground before deleting it from its own database)
    const foundCamp = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", `Review Deleted on ${foundCamp.title}!`)
    res.redirect(`/campgrounds/${id}`)
}