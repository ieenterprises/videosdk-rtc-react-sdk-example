
import React, { useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUserX } from "react-icons/fi";
import RemoveParticipantConfirmation from "../RemoveParticipantConfirmation";

const ParticipantListItem = ({ participantId }) => {
  const { localParticipantId } = useMeeting();
  const {
    displayName,
    webcamOn,
    micOn,
    isLocal,
    enableMic,
    disableMic,
    enableWebcam,
    disableWebcam,
  } = useParticipant(participantId);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const isHost = isLocal; // In this simple implementation, local participant is considered the host

  // Style for the control buttons
  const btnStyle = {
    margin: "0 5px",
    padding: "4px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  // Audio control
  const toggleAudio = () => {
    if (micOn) {
      disableMic();
    } else {
      enableMic();
    }
  };

  // Video control
  const toggleVideo = () => {
    if (webcamOn) {
      disableWebcam();
    } else {
      enableWebcam();
    }
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Avatar/Initial */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#5f6368",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            color: "white",
            fontWeight: "bold"
          }}
        >
          {displayName && displayName.charAt(0).toUpperCase()}
        </div>
        
        {/* Name with (You) indicator */}
        <span>{displayName} {isLocal ? "(You)" : ""}</span>
      </div>
      
      <div style={{ display: "flex" }}>
        {/* Only show controls for non-local participants if local is host */}
        {(!isLocal && localParticipantId === participantId) && (
          <>
            {/* Mic toggle button */}
            <button 
              onClick={toggleAudio} 
              style={btnStyle}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? <FiMic color="#1C1F2E" /> : <FiMicOff color="#1C1F2E" />}
            </button>
            
            {/* Camera toggle button */}
            <button 
              onClick={toggleVideo} 
              style={btnStyle}
              title={webcamOn ? "Turn off camera" : "Turn on camera"}
            >
              {webcamOn ? <FiVideo color="#1C1F2E" /> : <FiVideoOff color="#1C1F2E" />}
            </button>
            
            {/* Remove participant button */}
            <button 
              onClick={() => setShowConfirmation(true)} 
              style={btnStyle}
              title="Remove participant"
            >
              <FiUserX color="#FF5D5D" />
            </button>
          </>
        )}
      </div>
      
      {/* Confirmation dialog */}
      {showConfirmation && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <RemoveParticipantConfirmation 
            participantId={participantId} 
            onClose={() => setShowConfirmation(false)} 
          />
        </div>
      )}
    </div>
  );
};

const ParticipantPanel = ({ panelHeight }) => {
  const { participants } = useMeeting();
  const participantIds = [...participants.keys()];

  return (
    <div
      style={{
        height: panelHeight,
        overflowY: "auto",
        padding: "0",
        background: "#F6F6F6"
      }}
    >
      {participantIds.length > 0 ? (
        participantIds.map((participantId) => (
          <ParticipantListItem 
            key={participantId} 
            participantId={participantId} 
          />
        ))
      ) : (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          No participants
        </div>
      )}
    </div>
  );
};

export default ParticipantPanel;
