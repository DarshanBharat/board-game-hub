import express from "express";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import { db } from "./db";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const SQLiteStore = connectSqlite3(session);

app.use(express.json());
app.use(
  session({
    store: new SQLiteStore({
      db: process.env.DATABASE_URL || "sqlite.db",
      table: "session",
    }) as any,
    secret: process.env.SESSION_SECRET || "development-secret-key-123456789",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

registerRoutes(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
