import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

console.log("Mongo URI loaded:", !!process.env.MONGO_URI);
console.log("Port loaded:", !!process.env.PORT);
console.log("CORS origin:", process.env.CLIENT_URL);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NEXUS server running on http://localhost:${PORT}`);
});
