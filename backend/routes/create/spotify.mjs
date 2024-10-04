import express from "express";
import fetch from "node-fetch"; // Ensure you have node-fetch installed for fetch support

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Route to handle the creation of a Spotify playlist and add songs to it
app.post("/api/spotify/playlist", async (req, res) => {
  try {
    // Parse the incoming request body
    const { accessToken, userId, songs } = req.body;

    // Check for required fields
    if (!accessToken || !userId || !songs || !Array.isArray(songs)) {
      return res.status(400).json({
        error: "Missing required fields or invalid data format",
      });
    }

    // Validate each song object
    const validSongs = songs.every((song) => song.songName && song.artistName);

    if (!validSongs) {
      return res.status(400).json({
        error: "Each song must contain both songName and artistName",
      });
    }

    // Step 1: Create a new playlist
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Playlist", // Customize playlist name if needed
          description: "Created with my app", // Optional description
          public: false, // Set to true if you want the playlist to be public
        }),
      }
    );

    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      return res
        .status(playlistResponse.status)
        .json({ error: "Failed to create playlist", details: errorData });
    }

    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    // Step 2: Search for each song and get its URI
    const songURIs = [];
    const songsNotFound = [];

    for (const song of songs) {
      // Remove parentheses and their content from song names
      const cleanSongName = song.songName.replace(/\(.*?\)/g, "").trim();

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(
          cleanSongName
        )}%20artist:${encodeURIComponent(song.artistName)}&type=track`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const tracks = searchData.tracks.items;

        if (tracks.length > 0) {
          // Get the first track's URI
          songURIs.push(tracks[0].uri);
        } else {
          songsNotFound.push({
            songName: song.songName,
            artistName: song.artistName,
          });
          console.warn(
            `No track found for ${song.songName} by ${song.artistName}`
          );
        }
      } else {
        console.error(
          "Failed to search for song:",
          song,
          await searchResponse.json()
        );
      }
    }

    // Step 3: Add songs to the newly created playlist (in chunks of 20 URIs)
    const chunkSize = 20;
    for (let i = 0; i < songURIs.length; i += chunkSize) {
      const urisChunk = songURIs.slice(i, i + chunkSize);

      const addSongsResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: urisChunk }),
        }
      );

      if (!addSongsResponse.ok) {
        const errorData = await addSongsResponse.json();
        return res
          .status(addSongsResponse.status)
          .json({
            error: "Failed to add songs to playlist",
            details: errorData,
          });
      }
    }

    // Respond with a success message
    return res.json({
      message: "Songs successfully processed and added to the playlist",
      songsNotFound,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Failed to process request",
      details: error.message,
    });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
