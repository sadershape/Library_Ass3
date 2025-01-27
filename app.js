require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// ✅ Connect to MongoDB
connectDB()
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// ✅ Configure sessions with MongoDB storage
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// ✅ Load Routes (Ensure These Files Exist)
try {
    app.use("/", require("./routes/authRoutes")); // Login & Authentication
    app.use("/books", require("./routes/bookRoutes")); // Books API
    app.use("/weather", require("./routes/weatherRoutes")); // Weather API
    app.use("/currency", require("./routes/currencyRoutes")); // Currency API
    app.use("/admin", require("./routes/adminRoutes")); // Admin Panel
    app.use("/history", require("./routes/historyRoutes")); // History Feature
    app.use("/opengraph", require("./routes/opengraphRoutes")); // OpenGraph API
} catch (error) {
    console.error("❌ Route Loading Error:", error);
}

// ✅ Default Home Route
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user || null });
});

// ✅ Debugging: Show Full Errors Instead of Generic Message
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).send(`<h1>Server Error</h1><p>${err.message}</p>`);
});

// ✅ 404 Not Found Handler
app.use((req, res) => {
    res.status(404).send("❌ 404 Not Found");
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
