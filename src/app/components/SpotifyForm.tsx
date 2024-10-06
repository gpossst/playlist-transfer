import React, { useState } from "react";
import { FaArrowRight, FaSpinner } from "react-icons/fa";

// Predefined list of valid playlist link prefixes (e.g., Spotify, Apple Music)
const validPlaylistLinks = [
  "https://open.spotify.com/playlist",
  "https://music.apple.com/",
];

// Utility function to extract playlist ID from a validated link
const extractPlaylistId = (link: string): string | null => {
  // Spotify playlist link: "https://open.spotify.com/playlist/{playlistId}"
  if (link.startsWith("https://open.spotify.com/playlist")) {
    const parts = link.split("/playlist/");
    return parts.length > 1 ? parts[1].split("?")[0] : null;
  }

  // Apple Music playlist link: "https://music.apple.com/us/playlist/{playlistId}"
  if (link.startsWith("https://music.apple.com/")) {
    const parts = link.split("/playlist/");
    return parts.length > 1 ? parts[1].split("?")[0] : null;
  }

  return null; // Return null if the link is not valid or cannot extract ID
};

function SpotifyForm({
  user,
  accessToken,
}: {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  accessToken: string;
}) {
  const [playlistLink, setPlaylistLink] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [notFoundSongs, setNotFoundSongs] = useState<
    { songName: string; artistName: string }[]
  >([]); // State for unfound songs
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    const isValidLink = validPlaylistLinks.some((validLink) =>
      playlistLink.startsWith(validLink)
    );

    if (isValidLink) {
      setErrorMessage(null);
      setSuccessMessage("Sit back, this could take up to 5 minutes.");
      setIsValid(true);

      const playlistId = extractPlaylistId(playlistLink);

      console.log(playlistId);

      if (playlistId) {
        try {
          setLoading(true);

          // Make a POST request to scrape song data
          const scrapeResponse = await fetch(
            "https://api.playlisttransfers.app/scrape/apple-music", // Ensure this URL is correct
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ playlistId }),
            }
          );

          const scrapeData = await scrapeResponse.json();

          if (scrapeData.pairedData) {
            const songs = scrapeData.pairedData;

            const postResponse = await fetch(
              "https://api.playlisttransfers.app/api/spotify/playlist",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accessToken,
                  userId: user.id,
                  songs,
                }),
              }
            );

            const postData = await postResponse.json();

            if (postResponse.ok) {
              setSuccess(true);
              setSuccessMessage("Songs successfully submitted!");

              // Display unfound songs from API response
              if (postData.songsNotFound) {
                setNotFoundSongs(postData.songsNotFound);
              } else {
                setNotFoundSongs([]);
              }
            } else {
              setSuccessMessage(null);
              setErrorMessage("Failed to submit songs. Please try again.");
              setNotFoundSongs([]); // Clear the previous not found songs
            }
          } else {
            setErrorMessage("No song data found. Please try again.");
          }
        } catch (error) {
          console.error("Failed to submit playlist:", error);
          setErrorMessage("Failed to submit playlist. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setErrorMessage("Unable to extract playlist ID. Please try again.");
        setIsValid(false);
      }
    } else {
      setErrorMessage("Invalid playlist link. Please try again.");
      setIsValid(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 justify-center items-center">
      <div className="flex items-center gap-2 w-[40rem] justify-center">
        <div
          className={`flex text-[#292929] font-bold p-4 border-4 rounded-full drop-shadow-[5px_5px_0_rgba(41,41,41,1)] align-center bg-[#e0e0e0] w-full ${
            isValid ? "border-[#292929]" : "border-[#DB2763]"
          }`}
        >
          <input
            className="outline-none w-full bg-inherit placeholder-[#DB2763]"
            type="text"
            value={playlistLink}
            onChange={(e) => setPlaylistLink(e.target.value)}
            placeholder="Playlist link:"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex border-[#292929] text-[#292929] font-bold p-4 border-4 rounded-full drop-shadow-[5px_5px_0_rgba(41,41,41,1)] align-center bg-[#DB2763]"
        >
          {loading ? (
            <FaSpinner className="animate-spin" size={20} />
          ) : (
            <FaArrowRight size={20} />
          )}
        </button>
      </div>

      {success && (
        <div>
          <div>
            Everything worked. You can navigate away from this page now.
          </div>
        </div>
      )}

      {errorMessage && <p className="text-[#DB2763]">{errorMessage}</p>}
      {successMessage && <p className="">{successMessage}</p>}

      {/* Display unfound songs if any */}
      {notFoundSongs.length > 0 && (
        <div className="mt-4">
          <h3 className="text-yellow-500">
            There were a few songs we weren&apos;t able to find. Here they are:
          </h3>
          <ul className="list-disc list-inside">
            {notFoundSongs.map((song, index) => (
              <li className="list-none" key={index}>
                <span className="font-bold text-lg">{song.songName}</span> by{" "}
                <span className="text-sm">{song.artistName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SpotifyForm;
