import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Item from "./models/Item.js";
import ejs from "ejs";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// ✅ Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Check required environment variables
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error("❌ Missing required environment variables! Please set MONGO_URI and SESSION_SECRET in .env file.");
    process.exit(1);
}

// ✅ Connect to MongoDB
connectDB()
    .then(() => {
        console.log("✅ MongoDB Connected");
        createAdminUser();
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
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

// ✅ Load Translations Function
const loadTranslations = (language) => {
    const filePath = path.join(__dirname, "locales", `${language}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return {}; // Return an empty object if translation file is missing
};

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
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// ✅ Set and Load Translations Middleware
app.use((req, res, next) => {
    if (!req.session.language) {
        req.session.language = "en";
    }
    res.locals.language = req.session.language;
    res.locals.translations = loadTranslations(req.session.language);
    next();
});

// ✅ Language Change Route
app.get("/set-language/:lang", (req, res) => {
    const { lang } = req.params;
    if (["en", "ru"].includes(lang)) {
        req.session.language = lang;
        res.locals.translations = loadTranslations(lang);
        return res.redirect(req.get("Referer") || "/");
    }
    res.status(400).json({ error: "Invalid language selection" });
});

// ✅ Ensure `user` is available in all EJS views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ✅ Dynamic Route Imports (with Error Handling)
const importRoutes = async () => {
    try {
        const authRoutes = (await import("./routes/authRoutes.js")).default;
        const bookRoutes = (await import("./routes/bookRoutes.js")).default;
        const openLibraryRoutes = (await import("./routes/openLibraryRoutes.js")).default;
        const adminRoutes = (await import("./routes/adminRoutes.js")).default;
        const historyRoutes = (await import("./routes/historyRoutes.js")).default;

        app.use("/", authRoutes);
        app.use("/books", bookRoutes);
        app.use("/api/openlibrary", openLibraryRoutes);
        app.use("/admin", adminRoutes);
        app.use("/history", historyRoutes);

        console.log("✅ All routes loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading routes:", error);
        process.exit(1);
    }
};

// ✅ Home Route
app.get("/", async (req, res) => {
    try {
        const items = await Item.find({ deletedAt: null });
        res.render("index", { user: req.session.user, items, translations: res.locals.translations });
    } catch (error) {
        console.error("❌ Error fetching items:", error);
        res.render("index", { user: req.session.user, items: [], translations: res.locals.translations });
    }
});

// ✅ 404 Error Handling
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ error: `404 Not Found: ${req.originalUrl}` });
});

// ✅ Debugging: Show Full Errors
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
importRoutes().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
