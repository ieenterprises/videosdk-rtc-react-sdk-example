
import React, { useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";

export const ParticipantPanel = () => {
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  
  const { participants, localParticipantId } = useMeeting();
  
  const handleRemoveClick = (participantId) => {
    setSelectedParticipantId(participantId);
    setShowRemoveConfirmation(true);
  };
  
  const handleCloseConfirmation = () => {
    setShowRemoveConfirmation(false);
    setSelectedParticipantId(null);
  };

  const participantIds = [...participants.keys()];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {participantIds.map((participantId) => {
          const participant = participants.get(participantId);
          const isLocal = participantId === localParticipantId;
          
          return (
            <div
              key={participantId}
              className="my-1 flex items-center justify-between rounded p-2 hover:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {participant.displayName?.charAt(0) || "U"}
                </div>
                <div className="ml-2 font-medium">
                  {participant.displayName || "Unnamed"} {isLocal ? "(You)" : ""}
                </div>
              </div>
              
              {!isLocal && (
                <button
                  onClick={() => handleRemoveClick(participantId)}
                  className="rounded bg-red-500 px-2 py-1 text-white text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {showRemoveConfirmation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded shadow-lg z-10">
          <RemoveParticipantConfirmation
            participantId={selectedParticipantId}
            onClose={handleCloseConfirmation}
          />
        </div>
      )}
    </div>
  );
};
