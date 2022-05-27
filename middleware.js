const { campgroundSchema, reviewSchema } = require("./Schemas.js")
const AppError = require("./utilities/AppError")
const Campground = require("./models/campgrounds")
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next) => {
    //req.user prints out the deserialized version of our user (id, email and username)
    console.log("****  Is logged in middleware")
    if (!req.isAuthenticated()) {
        //this is the save the page the user was trying to access. If he needs to be logged in, when he"ll do, ill be redirected to the page he was looking for
        req.session.returnTo = req.originalUrl
        req.flash("error", "Please Log in  to access this functionnality")
        return res.redirect("/login")
    }
    next()


}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    //this will go through error.details et look for message. all message will be stored in msg, separated by a ,

    console.log("****  validate campground middleware")//test bc validate campground seems to run randomly
    if (error) {

        const msg = error.details.map(el => el.message).join(",")
        throw new AppError(msg, 400)

    } else {
        next();
    }
    //This is the joi validation system, wich validate thing even before mongoose and our website does. It prevent people from sending invalid infoprmation from outside our website, wich the first validation wouldn't catch
}

module.exports.isAuthor = async (req, res, next) => {
    console.log("****  is Author middleware")
    const { id } = req.params
    const foundCamp = await Campground.findById(id)
    if (!foundCamp.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that")
        return res.redirect(`/campgrounds/${foundCamp._id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    console.log("****  is Review Author middleware")
    const { id, reviewId } = req.params
    const foundReview = await Review.findById(reviewId)
    if (!foundReview.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
// module.exports.isReviewAuthor = async(req,res,next)=>{
//     console.log("is review author middleware")
//     const
// }


module.exports.validateReview = (req, res, next) => {
    console.log("****  Validate Review Middleware")
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new AppError(msg, 400)
    } else {
        next();
    }
}


