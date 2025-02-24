import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Item from "./models/Item.js";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// ✅ Check required environment variables
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error("❌ Missing required environment variables! Please set MONGO_URI and SESSION_SECRET in .env file.");
    process.exit(1); // Stop the server if critical variables are missing
}

// ✅ Connect to MongoDB
connectDB()
    .then(() => {
        console.log("✅ MongoDB Connected");
        createAdminUser(); // Ensure admin exists when DB connects
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Stop server if DB connection fails
    });

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

// ✅ Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Configure sessions with MongoDB storage
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// ✅ Set default language if not set
app.use((req, res, next) => {
    if (!req.session.language) {
        req.session.language = "en"; // Default to English
    }
    res.locals.language = req.session.language; // Make available in all views
    next();
});

// ✅ Route to change language
app.get("/change-language/:lang", (req, res) => {
    const { lang } = req.params;
    if (["en", "ru"].includes(lang)) {
        req.session.language = lang;
    }
    res.redirect(req.get("Referer") || "/"); // Redirect back to the same page
});

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

// ✅ Dynamic Route Imports (with Error Handling)
const importRoutes = async () => {
    try {
        const authRoutes = (await import("./routes/authRoutes.js")).default;
        const bookRoutes = (await import("./routes/bookRoutes.js")).default;
        const openLibraryRoutes = (await import("./routes/openLibraryRoutes.js")).default;
        const weatherRoutes = (await import("./routes/weatherRoutes.js")).default;
        const currencyRoutes = (await import("./routes/currencyRoutes.js")).default;
        const adminRoutes = (await import("./routes/adminRoutes.js")).default;
        const historyRoutes = (await import("./routes/historyRoutes.js")).default;
        const opengraphRoutes = (await import("./routes/opengraphRoutes.js")).default;

        app.use("/", authRoutes);
        app.use("/books", bookRoutes);
        app.use("/api/openlibrary", openLibraryRoutes);
        app.use("/weather", weatherRoutes);
        app.use("/currency", currencyRoutes);
        app.use("/admin", adminRoutes);
        app.use("/history", historyRoutes);
        app.use("/opengraph", opengraphRoutes);

        console.log("✅ All routes loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading routes:", error);
        process.exit(1); // Stop server if routes fail to load
    }
};

// ✅ Google Books Page
app.get("/googlebooks", (req, res) => {
    res.render("googleBooks");
});

// ✅ Home Route - Fetch Items Before Rendering Index Page
app.get("/", async (req, res) => {
    try {
        const items = await Item.find({ deletedAt: null });
        console.log("📌 Items fetched:", items);
        res.render("index", { user: req.session.user, items, language: req.session.language });
    } catch (error) {
        console.error("❌ Error fetching items:", error);
        res.render("index", { user: req.session.user, items: [], language: req.session.language });
    }
});

// ✅ 404 Error Handling for Unrecognized Routes
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ error: `404 Not Found: ${req.originalUrl}` });
});

// ✅ Debugging: Show Full Errors Instead of Generic Message
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;

importRoutes().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
