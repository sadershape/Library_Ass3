const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id).lean();
        if (!user) {
            return res.status(404).render("userProfile", { user: null, error: "User not found." });
        }
        res.render("userProfile", { user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.render("userProfile", { user: null, error: "An error occurred while fetching the user profile." });
    }
};
