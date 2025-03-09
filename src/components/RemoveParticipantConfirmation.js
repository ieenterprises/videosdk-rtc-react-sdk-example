
import React from "react";

export const RemoveParticipantConfirmation = ({ participantId, onConfirm, onClose }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white text-lg font-medium mb-2">Remove Participant</h3>
      <p className="text-gray-300 mb-4">
        Are you sure you want to remove this participant?
      </p>
      <div className="flex justify-end space-x-2">
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => {
            onConfirm(participantId);
            onClose();
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
