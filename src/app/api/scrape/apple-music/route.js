import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const maxDuration = 5 * 60;

export async function POST(request) {
  try {
    // Parse the request body to get the playlist ID
    const { playlistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Construct the playlist URL using the provided playlistId
    const playlistUrl = `https://music.apple.com/us/playlist/${playlistId}`;

    // Navigate to the playlist page
    await page.goto(playlistUrl, { waitUntil: "networkidle2" });

    // Wait for the necessary elements to load
    await page.waitForSelector(".songs-list-row__song-name");
    await page.waitForSelector(".songs-list-row__by-line span");

    // Extract song names
    const songNames = await page.$$eval(
      ".songs-list-row__song-name",
      (elements) => elements.map((element) => element.textContent?.trim())
    );

    // Extract text inside the span in "songs-list-row__by-line" div (assumed to be the artist names)
    const byLineText = await page.$$eval(
      ".songs-list-row__by-line span",
      (elements) => elements.map((element) => element.textContent?.trim())
    );

    // Pair the song names with the corresponding by-line text (artists)
    const pairedData = songNames.map((songName, index) => ({
      songName,
      artistName: byLineText[index] || "Unknown", // In case the by-line is missing
    }));

    await browser.close();

    return NextResponse.json({ pairedData });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}
