"use client";
import React from "react";
import SpotifyAuthButton from "./components/SpotifyLogin";
import AppleAuthButton from "./components/AppleLogin";
import Masthead from "@/app/assets/masthead.svg";

function Home() {
  return (
    <div className="min-h-[75vh] pt-16 flex flex-col items-center justify-center">
      <Masthead className="scale-[2]" />
      <div className="flex flex-col items-center pt-24">
        <div className="font-semibold text-xl pt-8">
          Sign in with your preferred streaming service:
        </div>
        <div className="flex gap-5 pt-4">
          <SpotifyAuthButton />
          <AppleAuthButton />
        </div>
      </div>
    </div>
  );
}

export default Home;
