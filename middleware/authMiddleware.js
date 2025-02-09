module.exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("❌ Access Denied: Admins Only.");
    }
    next();
};
