
import React, { useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";
import { FaRegTrashAlt } from "react-icons/fa";

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
    <div className="h-full overflow-y-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Participants ({participantIds.length})</h2>
      <div className="flex flex-col space-y-2">
        {participantIds.map((participantId) => {
          const participant = participants.get(participantId);
          const isLocal = participantId === localParticipantId;
          
          return (
            <div 
              key={participantId}
              className="flex items-center justify-between rounded bg-gray-700 p-2"
            >
              <span className="text-white">{participant.displayName || (isLocal ? "You" : "Guest")}</span>
              {!isLocal && (
                <button
                  onClick={() => handleRemoveClick(participantId)}
                  className="rounded bg-red-500 px-2 py-1 text-white"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {showRemoveConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded bg-white p-4 text-black">
            <RemoveParticipantConfirmation
              participantId={selectedParticipantId}
              onClose={handleCloseConfirmation}
            />
          </div>
        </div>
      )}
    </div>
  );
};
