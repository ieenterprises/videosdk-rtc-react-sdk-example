import React, { useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUserX } from "react-icons/fi";
import RemoveParticipantConfirmation from "../RemoveParticipantConfirmation";

const ParticipantListItem = ({ participantId }) => {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);
  const { toggleMic, toggleWebcam, remove } = useParticipant(participantId);
  const { localParticipant } = useMeeting();
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  const isHost = localParticipant?.id !== participantId;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <p className="text-white">{displayName || "Unnamed"} {isLocal ? "(You)" : ""}</p>
        </div>

        {isHost && (
          <div className="flex space-x-2">
            <button 
              onClick={() => toggleMic()} 
              className="p-2 rounded-full hover:bg-gray-700 text-white"
              title={micOn ? "Mute participant" : "Unmute participant"}
            >
              {micOn ? <FiMicOff size={18} /> : <FiMic size={18} />}
            </button>
            <button 
              onClick={() => toggleWebcam()} 
              className="p-2 rounded-full hover:bg-gray-700 text-white"
              title={webcamOn ? "Turn off camera" : "Turn on camera"}
            >
              {webcamOn ? <FiVideoOff size={18} /> : <FiVideo size={18} />}
            </button>
            <button 
              onClick={() => setShowRemoveConfirmation(true)} 
              className="p-2 rounded-full hover:bg-gray-700 text-red-500"
              title="Remove participant"
            >
              <FiUserX size={18} />
            </button>
          </div>
        )}
      </div>

      {showRemoveConfirmation && (
        <RemoveParticipantConfirmation 
          participantId={participantId}
          displayName={displayName || "Unnamed"}
          onClose={() => setShowRemoveConfirmation(false)}
        />
      )}
    </>
  );
};

const ParticipantPanel = () => {
  const { participants } = useMeeting();
  const participantIds = [...participants.keys()];

  return (
    <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
      {participantIds.length > 0 ? (
        participantIds.map((participantId) => (
          <ParticipantListItem key={participantId} participantId={participantId} />
        ))
      ) : (
        <p className="text-white text-center p-4">No participants yet</p>
      )}
    </div>
  );
};

export default ParticipantPanel;