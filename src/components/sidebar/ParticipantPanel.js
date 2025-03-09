
import React, { useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUserX } from "react-icons/fi";
import RemoveParticipantConfirmation from "../RemoveParticipantConfirmation";

const ParticipantListItem = ({ participantId }) => {
  const { localParticipantId, removeParticipant } = useMeeting();
  const {
    displayName,
    webcamOn,
    micOn,
    isLocal,
  } = useParticipant(participantId);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const isHost = localParticipantId === participantId;
  const canControl = !isLocal && localParticipantId === participantId;

  const handleRemoveParticipant = () => {
    setShowConfirmation(true);
  };

  const confirmRemoveParticipant = () => {
    removeParticipant(participantId);
    setShowConfirmation(false);
  };

  const cancelRemoveParticipant = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="flex items-center justify-between w-full py-3 px-4 hover:bg-gray-750">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-750 flex items-center justify-center mr-3 text-white">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-white">
            {displayName || "Unnamed"} {isLocal ? "(You)" : ""}
            {isHost && !isLocal && " (Host)"}
          </p>
        </div>
      </div>
      
      {!isLocal && localParticipantId && (
        <div className="flex items-center space-x-3">
          <span className="text-white text-lg">
            {micOn ? <FiMic /> : <FiMicOff />}
          </span>
          <span className="text-white text-lg">
            {webcamOn ? <FiVideo /> : <FiVideoOff />}
          </span>
          {canControl && (
            <button
              onClick={handleRemoveParticipant}
              className="text-red-500 text-lg"
            >
              <FiUserX />
            </button>
          )}
        </div>
      )}
      
      {showConfirmation && (
        <RemoveParticipantConfirmation
          participantName={displayName || "this participant"}
          onCancel={cancelRemoveParticipant}
          onConfirm={confirmRemoveParticipant}
        />
      )}
    </div>
  );
};

const ParticipantPanel = ({ panelHeight }) => {
  const { participants } = useMeeting();
  const participantIds = [...participants.keys()];

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: panelHeight - 100 }}
    >
      <div className="w-full">
        {participantIds.map((participantId) => (
          <ParticipantListItem 
            key={participantId} 
            participantId={participantId} 
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantPanel;
