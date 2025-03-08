import React, { useEffect, useRef, useState } from "react";
import animationData from "../../../src/static/animations/join_meeting.json";
import Lottie from "lottie-react";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";

const WaitingToJoinScreen = () => {
  const waitingMessages = [
    { index: 0, text: "Creating a room for you..." },
    { index: 1, text: "Almost there..." },
  ];
  const [message, setMessage] = useState(waitingMessages[0]);

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMessage((s) =>
        s.index === waitingMessages.length - 1
          ? s
          : waitingMessages[s.index + 1]
      );
    }, 3000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const isTab = useIsTab();
  const isMobile = useIsMobile();

  const animationDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      className="bg-gray-800"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1a1c22 0%, #26282c 100%)",
      }}
    >
      <div className="flex flex-col items-center">
        <div
          style={{
            height: isTab ? 200 : isMobile ? 200 : 250,
            width: isTab ? 200 : isMobile ? 200 : 250,
            filter: "drop-shadow(0 0 12px rgba(85, 104, 254, 0.3))",
            margin: "0 auto",
          }}
        >
          <Lottie
            loop={animationDefaultOptions.loop}
            autoplay={animationDefaultOptions.autoplay}
            animationData={animationDefaultOptions.animationData}
            rendererSettings={{
              preserveAspectRatio:
                animationDefaultOptions.rendererSettings.preserveAspectRatio,
            }}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
        <h1 
          className="text-center font-bold mt-6 text-2xl"
          style={{ 
            backgroundImage: "linear-gradient(90deg, #5568FE, #76d9e6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 10px rgba(85, 104, 254, 0.2)"
          }}
        >
          {message.text}
        </h1>
        <div className="mt-4 bg-black bg-opacity-20 px-5 py-3 rounded-full">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-150 animate-pulse"></div>
            <p className="text-gray-400 text-sm">Preparing secure connection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingToJoinScreen;
