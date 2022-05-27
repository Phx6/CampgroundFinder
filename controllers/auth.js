const User = require("../models/user")

module.exports.registerpage = (req, res) => {
    res.render("auth/register")
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const checkEmail = await User.findOne({ email })
        if (checkEmail) {
            req.flash("error", "This email is already used")
            return res.redirect("/register")
        }
        const newUser = new User({ email, username })
        const registeredUser = await User.register(newUser, password)
        //this is to login  directly when you create an acount
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash("success", `Welcome to Campground-Finder ${username} !`)
            res.redirect("/campgrounds")
        })

    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/register")
    }
}

module.exports.loginpage = (req, res) => {
    res.render("auth/login")
}

module.exports.login = (req, res) => {
    //the reason i deconstruct username is just to display it in our string template litteral
    const { username } = req.body
    req.flash("success", `Welcome back ${username} !`)
    //if we stored the returnTo(where the user wanted to go before logging in, redirect him there, otherwise, redirect him to campground) then delete it from returnTo
    const redirectUrl = req.session.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout();//built in passport, logout the user
    req.flash("success", "Goodbye !")
    res.redirect("/campgrounds")
}