const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", UserSchema);
