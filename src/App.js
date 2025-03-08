import { MeetingProvider } from "@videosdk.live/react-sdk";
import { useEffect } from "react";
import { useState } from "react";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen"

import TawkToChat from './components/TawkToChat';

function App() {
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null)
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);

  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  useEffect(() => {
    if (isMobile) {
      window.onbeforeunload = () => {
        return "Are you sure you want to exit?";
      };
    }
    
    // Check for meetingId in URL params when app loads
    const urlParams = new URLSearchParams(window.location.search);
    const meetingIdParam = urlParams.get('meetingId');
    if (meetingIdParam) {
      setMeetingId(meetingIdParam);
    }
  }, [isMobile]);

  return (
    <>
      {/* Only show TawkToChat when not in a meeting and not on leave screen */}
      <TawkToChat isVisible={!isMeetingStarted && !isMeetingLeft} />
      
      <MeetingAppProvider>
        {isMeetingStarted ? (

          <MeetingProvider
            config={{
              meetingId,
              micEnabled: micOn,
              webcamEnabled: webcamOn,
              name: participantName ? participantName : "TestUser",
              multiStream: true,
              customCameraVideoTrack: customVideoStream,
              customMicrophoneAudioTrack: customAudioStream
            }}
            token={token}
            reinitialiseMeetingOnConfigChange={true}
            joinWithoutUserInteraction={true}
          >
            <MeetingContainer
              onMeetingLeave={() => {
                setToken("");
                setMeetingId("");
                setParticipantName("");
                setWebcamOn(false);
                setMicOn(false);
                setMeetingStarted(false);
                
                // Clean up any Tawk.to elements that might be present
                const tawkContainer = document.getElementById('tawk_6616a163a0c6737bd12a56c8');
                if (tawkContainer) {
                  tawkContainer.remove();
                }
                
                // Remove any Tawk.to scripts
                const tawkScripts = document.querySelectorAll('script[src*="tawk.to"]');
                tawkScripts.forEach(script => script.remove());
                
                // Remove Tawk iframe and widget elements
                const tawkIframes = document.querySelectorAll('iframe[src*="tawk.to"]');
                tawkIframes.forEach(iframe => iframe.remove());
                
                const tawkWidgets = document.querySelectorAll('.tawk-min-container, .tawk-card, .tawk-chat-panel');
                tawkWidgets.forEach(widget => widget.remove());
              }}
              setIsMeetingLeft={setIsMeetingLeft}
            />
          </MeetingProvider>

        ) : isMeetingLeft ? (
          <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
        ) : (

          <JoiningScreen
            participantName={participantName}
            setParticipantName={setParticipantName}
            setMeetingId={setMeetingId}
            setToken={setToken}
            micOn={micOn}
            setMicOn={setMicOn}
            webcamOn={webcamOn}
            setWebcamOn={setWebcamOn}
            customAudioStream={customAudioStream}
            setCustomAudioStream={setCustomAudioStream}
            customVideoStream={customVideoStream}
            setCustomVideoStream={setCustomVideoStream}
            onClickStartMeeting={(title) => {
              setMeetingStarted(true);
              localStorage.setItem("current_meeting_title", title || "Untitled Meeting");
            }}
            startMeeting={isMeetingStarted}
            setIsMeetingLeft={setIsMeetingLeft}
          />
        )}
      </MeetingAppProvider>
    </>
  );
}

export default App;
