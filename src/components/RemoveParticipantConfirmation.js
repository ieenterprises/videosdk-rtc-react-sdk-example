
import React from "react";
import { useMeeting } from "@videosdk.live/react-sdk";

export const RemoveParticipantConfirmation = ({ participantId, onClose }) => {
  const { participants, localParticipantId } = useMeeting();

  const handleParticipantRemove = () => {
    if (participantId && participants) {
      try {
        // Get the specific participant object
        const participant = participants.get(participantId);
        
        if (participant) {
          // The VideoSDK provides a remove() method on participant objects
          console.log("Removing participant:", participantId);
          participant.remove();
        } else {
          console.error("Participant not found:", participantId);
        }
        onClose();
      } catch (err) {
        console.error("Error removing participant:", err);
      }
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Remove Participant</h3>
      <p className="mb-4">Are you sure you want to remove this participant from the meeting?</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleParticipantRemove}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
};
