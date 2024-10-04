import express from "express";
import { chromium } from "playwright"; // Playwright import for Chromium browser
const app = express();

const router = express.Router();

app.use(express.json()); // To parse JSON request bodies

router.post("/scrape/apple-music", async (req, res) => {
  try {
    console.log("Received body:", req.body); // Log the request body for debugging

    const { playlistId } = req.body;

    if (!playlistId) {
      return res.status(400).json({ error: "Playlist ID is required" });
    }

    // Launch Playwright with Chromium
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Construct the playlist URL using the provided playlistId
    const playlistUrl = `https://music.apple.com/us/playlist/${playlistId}`;

    // Navigate to the playlist page
    await page.goto(playlistUrl, { waitUntil: "networkidle" });

    // Wait for the song names to load and create a locator
    const songNameLocator = page.locator(".songs-list-row__song-name");

    // Extract song names using locator.evaluateAll
    const songNames = await songNameLocator.evaluateAll((elements) =>
      elements.map((element) => element.textContent?.trim())
    );

    // Wait for the artist names to load and create a locator
    const artistNameLocator = page.locator(".songs-list-row__by-line span");

    // Extract artist names using locator.evaluateAll
    const artistNames = await artistNameLocator.evaluateAll((elements) =>
      elements.map((element) => element.textContent?.trim())
    );

    // Pair the song names with the corresponding artist names
    const pairedData = songNames.map((songName, index) => ({
      songName,
      artistName: artistNames[index] || "Unknown", // In case the artist name is missing
    }));

    // Close the browser after scraping
    await browser.close();

    // Return the scraped data
    return res.json({ pairedData });
  } catch (error) {
    console.error("Error during scraping: ", error.message);
    return res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
});

export default router;
