import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "dotenv/config";
const port = process.env.PORT;
console.log(port);

import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import Place from "./models/Place.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hasan Enterprises Plot Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      plots: "/api/plots",
      payments: "/api/payments",
      cases: "/api/cases",
      dashboard: "/api/dashboard",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const initializePlace = async () => {
  try {
    const existingPlace = await Place.findOne({ name: "Hassan Enterprises" });
    if (!existingPlace) {
      await Place.create({ name: "Hassan Enterprises" });
      console.log('Default place "Hassan Enterprises" created');
    }
  } catch (error) {
    console.error("Error initializing place:", error.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  await initializePlace();
});

export default app;
