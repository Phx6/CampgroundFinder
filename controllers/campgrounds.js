const Campground = require("../models/campgrounds")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken })
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}

module.exports.new = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.create = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground)
    //here we map over all of our file the add the pictures
    newCamp.geometry = geoData.body.features[0].geometry
    newCamp.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //this is so we know who created the campground
    newCamp.author = req.user._id
    await newCamp.save()
    console.log(newCamp)
    req.flash("success", `Successfully created ${newCamp.title} Campground!`)
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.edit = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findById(id)
    if (!foundCamp) {
        req.flash("error", "Cannot find that Campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { foundCamp })
}

module.exports.update = async (req, res) => {
    const { id } = req.params
    console.log(req.body.deleteImage)
    const updatedCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    //this create the array of new image
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }))
    updatedCamp.image.push(...img) //here we spread the array into single image, so we dont get an error for push in array in an other array in mongoose

    //here we check if anycheck boxes were checked to delete img. if yes, delete these images from mongo too
    if (req.body.deleteImage) {
        //here we delete the image from cloudinary
        for (let filename of req.body.deleteImage) {
            await cloudinary.uploader.destroy(filename)
        }
        //pull from the image array all images with the corresponding file name
        await updatedCamp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } } } })
    }
    await updatedCamp.save()
    console.log(updatedCamp)
    req.flash("success", `Successfully updated ${updatedCamp.title} Campground!`)
    res.redirect(`/campgrounds/${updatedCamp._id}`)
}

module.exports.delete = async (req, res) => {
    const { id } = req.params
    const foundCamp = await Campground.findByIdAndDelete(id)
    req.flash("success", `Successfully deleted ${foundCamp.title} Campground!`)
    res.redirect("/campgrounds")
}

module.exports.show = async (req, res) => {
    const foundCamp = await Campground.findById(req.params.id).populate({
        //this here is to be able to populate the review with its author while we populate the campground with those reviews

        path: "reviews",
        populate: {
            path: "author"
        }

    }).populate("author")

    if (!foundCamp) {
        req.flash("error", "Cannot find that Campground")
        res.redirect("/campgrounds")
    } else {
        res.render("campgrounds/show", { foundCamp })
    }
}