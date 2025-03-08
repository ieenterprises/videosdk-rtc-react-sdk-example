import React, { useEffect, useState, useRef } from "react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/outline";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { createMeeting, getToken, validateMeeting } from "../../api";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { toast } from "react-toastify";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  micOn,
  setMicOn,
  webcamOn,
  setWebcamOn,
  customAudioStream,
  setCustomAudioStream,
  customVideoStream,
  setCustomVideoStream,
  onClickStartMeeting,
  startMeeting,
  setIsMeetingLeft,
}) {
  const [deviceList, setDeviceList] = useState([]);
  const [videoTrack, setVideoTrack] = useState(null);

  const videoPlayerRef = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  useEffect(() => {
    if (customVideoStream && webcamOn && !videoTrack) {
      const stream = new MediaStream();
      stream.addTrack(customVideoStream.track);

      setVideoTrack(stream);
    }
  }, [customVideoStream, webcamOn, videoTrack]);

  useEffect(() => {
    // Add Tawk.to Customer Support Chat Script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/6616a163a0c6737bd12a56c8/1hr46cts6';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const checkDeviceAvailability = async () => {
      try {
        if (webcamOn || micOn) {
          await getDefaultMediaTracks({ webcamOn, micOn });
        }
      } catch (error) {
        console.error("Media device error:", error);
        toast(`Device error: ${error.message || "Could not access media devices"}`, {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Turn off devices if not available
        if (error.message.includes("Requested device not found")) {
          if (webcamOn) setWebcamOn(false);
          if (micOn) setMicOn(false);
        }
      }
    };

    checkDeviceAvailability();
  }, [webcamOn, micOn]);


  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Transparent Header with Logo */}
      <header className="bg-white bg-opacity-90 shadow-sm py-4 px-6 flex justify-between items-center fixed w-full z-10">
        <div className="text-2xl font-bold text-blue-600">ieVidMeet</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Features</a>
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Support</a>
        </nav>
      </header>

      <div className="flex flex-1 flex-col md:flex-row pt-20">
        {/* Left side - Hero Content */}
        <div className="md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">ieVidMeet</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
            Exclusive Private Video Chat for Code Calls
          </h2>
          <div className="prose max-w-none mb-8">
            <p className="text-gray-600 text-lg mb-4">
              Experience seamless video conferencing with crystal-clear audio and HD video quality. 
              ieVidMeet connects you with colleagues, friends, and family anywhere in the world.
            </p>
            <p className="text-gray-500 mb-4">
              Featuring real-time screen sharing, chat functionality, and secure meetings - all in one place.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">HD Video Quality</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-gray-700">Secure Meetings</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">Screen Sharing</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <span className="text-gray-700">Chat Functionality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Meeting Details */}
        <div className="md:w-1/2 bg-gray-50 p-6 md:p-10 rounded-tl-3xl">
          <div className="max-w-md mx-auto">
            {videoTrack && (
              <div className="rounded-lg overflow-hidden shadow-lg bg-white p-4 mb-6">
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={videoPlayerRef}
                  controls={false}
                  className="rounded-lg w-full h-48 object-cover bg-gray-800"
                />
              </div>
            )}

            <MeetingDetailsScreen
              participantName={participantName}
              setParticipantName={setParticipantName}
              videoTrack={videoTrack}
              setVideoTrack={setVideoTrack}
              onClickStartMeeting={onClickStartMeeting}
              onClickJoin={async (id) => {
                try {
                const token = await getToken();
                const { meetingId, err } = await validateMeeting({
                  roomId: id,
                  token,
                });
                if (meetingId === id) {
                  setToken(token);
                  setMeetingId(id);
                  onClickStartMeeting();
                } else {
                  toast(`${err}`, {
                    position: "bottom-left",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeButton: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
                } catch (error) {
                  console.error("Meeting join error:", error);
                  toast(`Error: ${error.message || "Failed to join meeting"}`, {
                    position: "bottom-left",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeButton: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
              }}
              _handleOnCreateMeeting={async () => {
                try {
                const token = await getToken();
                const { meetingId, err } = await createMeeting({ token });

                if (meetingId) {
                  setToken(token);
                  setMeetingId(meetingId);
                  onClickStartMeeting();
                } else {
                  toast(`${err || "Unknown error occurred"}`, {
                    position: "bottom-left",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeButton: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
                } catch (error) {
                  console.error("Create meeting error:", error);
                  toast(`Error: ${error.message || "Failed to create meeting"}`, {
                    position: "bottom-left",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeButton: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-gray-600 text-sm">
        <p>© 2023 ieVidMeet. All rights reserved.</p>
      </footer>
    </div>
  );
}