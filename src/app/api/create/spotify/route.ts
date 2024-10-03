import { NextResponse } from "next/server";

// Function to create a playlist on Spotify and add songs
export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { accessToken, userId, songs } = body;

    // Check for required fields
    if (!accessToken || !userId || !songs || !Array.isArray(songs)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid data format" },
        { status: 400 }
      );
    }

    // Check that each song object contains both songName and artistName
    const validSongs = songs.every(
      (song: { songName: string; artistName: string }) =>
        song.songName && song.artistName
    );

    if (!validSongs) {
      return NextResponse.json(
        { error: "Each song must contain both songName and artistName" },
        { status: 400 }
      );
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
          name: "New Playlist", // Customize the playlist name as needed
          description: "Created with my app", // Optional
          public: false, // Set to true if you want the playlist to be public
        }),
      }
    );

    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      return NextResponse.json(
        { error: "Failed to create playlist", details: errorData },
        { status: playlistResponse.status }
      );
    }

    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    // Step 2: Search for each song and get its URI
    const songURIs: string[] = [];
    const songsNotFound: { songName: string; artistName: string }[] = [];

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

    // Step 3: Add songs to the newly created playlist 20 URIs at a time
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
        return NextResponse.json(
          { error: "Failed to add songs to playlist", details: errorData },
          { status: addSongsResponse.status }
        );
      }
    }

    // Respond with a success message
    return NextResponse.json({
      message: "Songs successfully processed and added to the playlist",
      songsNotFound,
    });
  } catch (error) {
    // Catch any parsing or other errors and respond accordingly
    return NextResponse.json(
      { error: "Failed to process request", details: error },
      { status: 500 }
    );
  }
}
