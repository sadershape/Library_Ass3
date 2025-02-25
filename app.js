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
import AdminSection from "./models/AdminSection.js";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Check Required Environment Variables
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

// ✅ Create Admin User if Not Exists
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

// ✅ Load Translations
const loadTranslations = (language) => {
    const filePath = path.join(__dirname, "locales", `${language}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    console.warn(`⚠️ Missing translations for ${language}. Using fallback.`);
    return { nav: { login: "Login", logout: "Logout" } };
};

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

// ✅ Ensure Language is Set in Session
app.use((req, res, next) => {
    if (!req.session.language) {
        req.session.language = "en";
    }
    res.locals.language = req.session.language;
    res.locals.translations = loadTranslations(req.session.language);
    next();
});

// ✅ Fix Language Switching Route
app.get("/set-language/:lang", (req, res) => {
    const { lang } = req.params;
    if (["en", "ru"].includes(lang)) {
        req.session.language = lang;
        req.session.save(err => {
            if (err) {
                console.error("❌ Error saving session:", err);
                return res.status(500).json({ error: "Failed to save session" });
            }
            console.log("🌍 Language changed to:", req.session.language);
            return res.redirect(req.get("Referer") || "/");
        });
    } else {
        res.status(400).json({ error: "Invalid language selection" });
    }
});

// ✅ Ensure `user` is Available in All Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ✅ Import Routes
const importRoutes = async () => {
    try {
        const authRoutes = (await import("./routes/authRoutes.js")).default;
        const bookRoutes = (await import("./routes/bookRoutes.js")).default;
        const openLibraryRoutes = (await import("./routes/openLibraryRoutes.js")).default;
        const adminRoutes = (await import("./routes/adminRoutes.js")).default;
        const historyRoutes = (await import("./routes/historyRoutes.js")).default;

        app.use("/", authRoutes);
        app.use("/books", bookRoutes);
        app.use("/books/openlibrary", openLibraryRoutes);
        app.use("/books/openLibrary", openLibraryRoutes);
        app.use("/admin", adminRoutes);
        app.use("/history", historyRoutes);

        console.log("✅ All routes loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading routes:", error);
        process.exit(1);
    }
};

// ✅ Homepage Route
app.get("/", async (req, res) => {
    try {
        const items = await Item.find({ deletedAt: null });
        const adminSection = await AdminSection.findOne();
        res.render("index", {
            user: req.session.user,
            items,
            adminSection: adminSection || {},
            translations: res.locals.translations,
            language: res.locals.language
        });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.render("index", {
            user: req.session.user,
            items: [],
            adminSection: {},
            translations: res.locals.translations,
            language: res.locals.language
        });
    }
});

// ✅ Handle 404 Errors
app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ error: `404 Not Found: ${req.originalUrl}` });
});

// ✅ Handle Internal Server Errors
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Start Server
const startServer = async () => {
    try {
        await importRoutes();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
