import { FaSpotify } from "react-icons/fa";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ""; // Updated to use NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const redirectUri = "https://playlisttransfers.app/spotify/";
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope =
  "user-read-private user-read-email playlist-modify-private playlist-modify-public";

const SpotifyAuthButton = () => {
  // Generate random string for code_verifier
  const generateRandomString = (length: number) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    return randomValues.reduce(
      (acc, x) => acc + possible[x % possible.length],
      ""
    );
  };

  // Perform the redirect to Spotify authorization page
  const redirectToSpotifyAuthorize = async () => {
    try {
      const codeVerifier = generateRandomString(64);
      const data = new TextEncoder().encode(codeVerifier);
      const hashed = await crypto.subtle.digest("SHA-256", data);
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      window.localStorage.setItem("code_verifier", codeVerifier);

      const authUrl = new URL(authorizationEndpoint);
      const params = {
        response_type: "code",
        client_id: clientId,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
      };

      authUrl.search = new URLSearchParams(params).toString();
      window.location.href = authUrl.toString(); // Redirect the user to Spotify's authorization page
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="bg-[#DB2763] text-[#292929] font-bold p-4 border-4 border-[#292929] rounded-full hover:cursor-pointer drop-shadow-[5px_5px_0_rgba(41,41,41,1)] "
        onClick={redirectToSpotifyAuthorize}
      >
        <FaSpotify color="#e0e0e0" size={40} />
      </div>
    </div>
  );
};

export default SpotifyAuthButton;
