import React, { useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";

export const ParticipantPanel = () => {
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  const { participants, localParticipantId } = useMeeting();

  const handleRemoveClick = (participantId) => {
    if (participantId) {
      console.log("Selected participant for removal:", participantId);
      setSelectedParticipantId(participantId);
      setShowRemoveConfirmation(true);
    }
  };

  const handleCloseConfirmation = () => {
    setSelectedParticipantId(null);
    setShowRemoveConfirmation(false);
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
              <span className="text-white">
                {participant.displayName || (isLocal ? "You (Host)" : "Guest")}
                {isLocal && <span className="ml-2 text-xs text-gray-400">(Meeting Host)</span>}
              </span>
              {!isLocal && participant.displayName !== "You" && (
                <button
                  onClick={() => handleRemoveClick(participantId)}
                  className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showRemoveConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-96 rounded bg-gray-800 p-4 text-white">
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