require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Item = require("./models/Item");
const AdminSection = require("./models/AdminSection"); // Import AdminSection model

const app = express();

// ✅ Function to Create a Hardcoded Admin User
const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ username: "admin" });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const adminUser = new User({
                username: "admin",
                password: hashedPassword,
                role: "admin"
            });
            await adminUser.save();
            console.log("✅ Admin user created: admin/admin123");
        } else {
            console.log("⚡ Admin user already exists.");
        }
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    }
};

// ✅ Start Server with DB Connection
const startServer = async () => {
    try {
        await connectDB();
        console.log("✅ MongoDB Connected");
        await createAdminUser();

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

// ✅ Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Fix for "favicon.ico" 404 errors
app.use("/favicon.ico", (req, res) => res.status(204));

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

// ✅ Ensure `user` is available in all EJS views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ✅ Custom Flash Message Middleware
app.use((req, res, next) => {
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    delete req.session.success;
    delete req.session.error;
    next();
});

// ✅ Load Routes
app.use("/", require("./routes/authRoutes"));
app.use("/books", require("./routes/bookRoutes"));
app.use("/api/openlibrary", require("./routes/openLibraryRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/history", require("./routes/historyRoutes"));

// ✅ Google Books Page
app.get("/googlebooks", (req, res) => {
    res.render("googleBooks");
});

// ✅ Home Route - Fetch Items and Admin Section Before Rendering Index Page
app.get("/", async (req, res) => {
    try {
        const items = await Item.find({ deletedAt: null });
        const adminSection = await AdminSection.findOne(); // Fetch admin section

        console.log("📌 Items fetched:", items);
        console.log("📌 Admin Section fetched:", adminSection);

        res.render("index", { 
            user: req.session.user, 
            items, 
            adminSection: adminSection || {} // Ensure it is always an object
        });
    } catch (error) {
        console.error("❌ Error fetching items or admin section:", error);
        res.render("index", { 
            user: req.session.user, 
            items: [], 
            adminSection: {} 
        });
    }
});

// ✅ 404 Error Handling
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ error: `404 Not Found: ${req.originalUrl}` });
});

// ✅ Debugging Middleware for Errors
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Start the Server
startServer();
