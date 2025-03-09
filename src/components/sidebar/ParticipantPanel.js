import React, { useState, useEffect } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";

export const ParticipantPanel = () => {
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const { participants, localParticipantId, meetingId } = useMeeting();

  const participantIds = [...participants.keys()];

  // Determine if local participant is the meeting creator (host)
  useEffect(() => {
    // The first person to join a meeting is considered the creator/host
    // We can check if this was stored in localStorage when meeting was created
    const storedMeetingData = localStorage.getItem(`meeting_${meetingId}`);
    if (storedMeetingData) {
      const meetingData = JSON.parse(storedMeetingData);
      setIsHost(meetingData.creatorId === localParticipantId);
    } else if (participantIds.length > 0 && participantIds[0] === localParticipantId) {
      // If no stored data, assume first person is host
      setIsHost(true);
      // Store creator info
      localStorage.setItem(`meeting_${meetingId}`, JSON.stringify({
        creatorId: localParticipantId,
        createdAt: new Date().toISOString()
      }));
    }
  }, [localParticipantId, meetingId, participantIds]);

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


  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="mb-4 text-lg font-semibold">Participants ({participantIds.length})</h2>
      <div className="flex flex-col space-y-2">
        {participantIds.map((participantId) => {
          const participant = participants.get(participantId);
          const isLocal = participantId === localParticipantId;
          // Mark local user as host - they can't be removed

          return (
            <div
              key={participantId}
              className="flex items-center justify-between rounded bg-gray-700 p-2"
            >
              <span className="text-white">
                {participant.displayName || (isLocal ? "You" : "Guest")}
                {isLocal && <span className="ml-2 text-xs text-gray-400">(Meeting Host)</span>}
              </span>
              {!isLocal && isHost && ( // Only show remove button if local user is host
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