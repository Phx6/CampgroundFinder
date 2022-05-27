const mongoose = require("mongoose");
const { schema } = require("./campgrounds");

const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({
    body: String,
    rating: Number,
    author: {
        type: ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Review", reviewSchema)