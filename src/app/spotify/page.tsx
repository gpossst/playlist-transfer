"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SpotifyForm from "../components/SpotifyForm";
import { FaApple } from "react-icons/fa";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
const redirectUri = "http://localhost:3000/spotify/";
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope =
  "user-read-private user-read-email playlist-modify-private playlist-modify-public";

const SpotifyAccessPage = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      window.location.href = authUrl.toString();
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
        code_verifier: codeVerifier || "",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error fetching token: ${data.error}`);
    }
    return data;
  };

  // Fetch the Spotify user data
  const fetchSpotifyUser = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userData = await response.json();
      setUser(userData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  // On component mount, check for authorization code and handle token exchange
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

          // Fetch user data after getting the token
          fetchSpotifyUser(token.access_token);
        })
        .catch(() => {
          setError("Failed to retrieve access token");
          setLoading(false);
        });
    } else {
      // Fetch the access token from localStorage on mount
      const token = localStorage.getItem("access_token");
      if (token) {
        setAccessToken(token);
        fetchSpotifyUser(token);
      } else {
        setLoading(false); // Set loading to false if no token is found
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full flex-grow">
      {accessToken && user ? (
        <div className="w-full h-full pt-4">
          <div className="w-full flex flex-col h-full items-center pb-8">
            <div className="font-semibold text-xl">Accepted Links:</div>
            <div>
              <FaApple size={40} />
            </div>
          </div>
          <SpotifyForm user={user} accessToken={accessToken} />
        </div>
      ) : (
        <div>
          <p>{`Error: ${error}`}</p>
          <p>
            There was an issue receiving your Access Token or User Information
            from Spotify. Please try again.
          </p>
          <button
            className="p-4 bg-[#DB2763] hover:cursor-pointer rounded-full"
            onClick={redirectToSpotifyAuthorize}
          >
            Login with Spotify
          </button>
          <Link href="/">Home</Link>
        </div>
      )}
    </div>
  );
};

export default SpotifyAccessPage;
