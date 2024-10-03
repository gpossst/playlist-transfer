"use client";
import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ""; // Updated to use NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const redirectUri = "https://playlisttransfers.app/spotify/"; // Use environment variable or fallback
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope =
  "user-read-private user-read-email playlist-modify-private playlist-modify-public";

const SpotifyAuthButton = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError("Error initiating Spotify authorization");
    }
  };

  // Get the access token from Spotify using the authorization code
  const getToken = async (code: string) => {
    const tokenEndpoint = "https://accounts.spotify.com/api/token";
    const codeVerifier = localStorage.getItem("code_verifier");

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || "", // Ensure this is a string
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error fetching token: ${data.error}`);
    }
    return data;
  };

  // On component mount, check for authorization code in URL and handle token exchange
  useEffect(() => {
    const args = new URLSearchParams(window.location.search);
    const code = args.get("code");

    if (code) {
      // Exchange the authorization code for an access token
      getToken(code)
        .then((token) => {
          setAccessToken(token.access_token);
          window.localStorage.setItem("access_token", token.access_token);

          // Clear the authorization code from the URL after handling
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
        })
        .catch(() => {
          setError("Failed to retrieve access token");
        });
    }
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      {accessToken ? (
        <div>
          <p>Access Token: {accessToken}</p>
        </div>
      ) : error ? (
        <p>{`${error}, please try again.`}</p>
      ) : (
        <div
          className="bg-[#DB2763] text-[#292929] font-bold p-4 border-4 border-[#292929] rounded-full hover:cursor-pointer drop-shadow-[5px_5px_0_rgba(41,41,41,1)] "
          onClick={redirectToSpotifyAuthorize}
        >
          <FaSpotify color="#e0e0e0" size={40} />
        </div>
      )}
    </div>
  );
};

export default SpotifyAuthButton;
