const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id).lean();
        res.render("userProfile", { user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.render("userProfile", { user: null });
    }
};
