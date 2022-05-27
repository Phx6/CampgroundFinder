const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
//we don't add a username and a password because the passport pluggin will do it for us. this is the passport setup from passportlocalmongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema)