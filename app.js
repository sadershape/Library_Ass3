require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // Store sessions in MongoDB
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB().then(() => console.log("✅ MongoDB Connected")).catch(err => console.error("❌ MongoDB Connection Error:", err));

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensures views are correctly loaded

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON requests

// Configure sessions with MongoDB storage
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: "sessions" }), // Store sessions in MongoDB
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // 1-day session expiry
}));

// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/books", require("./routes/bookRoutes"));
app.use("/weather", require("./routes/weatherRoutes"));
app.use("/currency", require("./routes/currencyRoutes"));
app.use("/admin", require("./routes/adminRoutes")); // Added admin panel route
app.use("/history", require("./routes/historyRoutes")); // Added history route

// Default route
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user || null }); // Pass user session to EJS
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.stack);
    res.status(500).send("Something went wrong!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
