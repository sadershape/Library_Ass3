const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).redirect("/login");
        }

        const user = await User.findById(req.session.user._id).lean();
        if (!user) {
            return res.status(404).render("userProfile", { user: null, error: "User not found.", session: req.session });
        }

        res.render("userProfile", { user, session: req.session });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.render("userProfile", { user: null, error: "An error occurred while fetching the user profile.", session: req.session });
    }
};
