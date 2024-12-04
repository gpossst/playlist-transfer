import React, { useState, useEffect } from "react";
import { FaApple } from "react-icons/fa";

const AppleMusicAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [music, setMusic] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v1/musickit.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_DEVELOPER_TOKEN,
        app: {
          name: "My Music App",
          build: "1.0.0",
        },
      }).then((music) => {
        setMusic(music);
        if (music.isAuthorized) {
          setIsAuthorized(true);
        }
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAuthorize = async () => {
    if (music) {
      try {
        await music.authorize();
        setIsAuthorized(true);
      } catch (error) {
        console.error("Authorization failed", error);
      }
    }
  };

  const handleUnauthorize = () => {
    if (music) {
      music.unauthorize();
      setIsAuthorized(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-gray-400 text-[#555555] font-bold p-4 border-4 border-[#292929] rounded-full hover:cursor-pointer drop-shadow-[5px_5px_0_rgba(41,41,41,1)] ">
        <FaApple size={40} />
      </div>
    </div>
  );
};

export default AppleMusicAuth;
