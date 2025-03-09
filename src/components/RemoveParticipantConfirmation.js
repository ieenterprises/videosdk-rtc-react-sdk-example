
import React from "react";
import { useMeeting } from "@videosdk.live/react-sdk";

export const RemoveParticipantConfirmation = ({ participantId, onClose }) => {
  const meeting = useMeeting();

  const handleParticipantRemove = () => {
    if (participantId && meeting) {
      try {
        meeting.remove(participantId);
        console.log("Removing participant:", participantId);
        onClose();
      } catch (err) {
        console.error("Error removing participant:", err);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="mb-4 text-lg font-bold">Remove Participant</h2>
      <p className="mb-4">Are you sure you want to remove this participant?</p>
      <div className="flex flex-row items-center justify-end">
        <button
          className="mr-2 rounded bg-gray-300 px-4 py-2 text-black"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="rounded bg-red-500 px-4 py-2 text-white"
          onClick={handleParticipantRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
