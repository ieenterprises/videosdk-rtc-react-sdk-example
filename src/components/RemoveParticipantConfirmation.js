
import React from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

const RemoveParticipantConfirmation = ({ participantId, displayName, onClose }) => {
  const { remove } = useParticipant(participantId);

  const handleRemove = () => {
    remove();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Remove Participant</h2>
        <p className="text-white mb-6">
          Are you sure you want to remove {displayName} from the meeting?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipantConfirmation;
