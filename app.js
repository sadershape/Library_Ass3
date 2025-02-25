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

if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error("❌ Missing required environment variables! Please set MONGO_URI and SESSION_SECRET in .env file.");
    process.exit(1);
}

connectDB()
    .then(() => {
        console.log("✅ MongoDB Connected");
        createAdminUser();
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

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

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const importRoutes = async () => {
    try {
        console.log("📦 Importing routes...");

        const authRoutes = (await import("./routes/authRoutes.js")).default;
        console.log("✅ authRoutes loaded");

        const bookRoutes = (await import("./routes/bookRoutes.js")).default;
        console.log("✅ bookRoutes loaded");

        const openLibraryRoutes = (await import("./routes/openLibraryRoutes.js")).default;
        console.log("✅ openLibraryRoutes loaded");

        const adminRoutes = (await import("./routes/adminRoutes.js")).default;
        console.log("✅ adminRoutes loaded");

        const historyRoutes = (await import("./routes/historyRoutes.js")).default;
        console.log("✅ historyRoutes loaded");

        app.use("/", authRoutes);
        app.use("/books", bookRoutes);
        app.use("/books/openLibrary", openLibraryRoutes);
        app.use("/admin", adminRoutes);
        app.use("/history", historyRoutes);

        console.log("🚀 All routes loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading routes:", error);
        process.exit(1);
    }
};

app.get("/", async (req, res) => {
    try {
        const items = await Item.find({ deletedAt: null });
        const adminSection = await AdminSection.findOne();
        res.render("index", {
            user: req.session.user,
            items,
            adminSection: adminSection || {},
            language: "en" // Добавлено для исправления ошибки
        });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.render("index", {
            user: req.session.user,
            items: [],
            adminSection: {},
            language: "en" // Добавлено для исправления ошибки
        });
    }
});

app.use((req, res) => {
    console.error(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ error: `404 Not Found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

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
