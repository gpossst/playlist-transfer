import express from "express";
import scrapeRoutes from "./routes/scrape/apple-music.mjs"; // Assume your routes are stored in a separate file

const app = express();

// Ensure this comes before your routes
app.use(express.json()); // To parse JSON request bodies

// Use the router that contains the scraping route
app.use(scrapeRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
