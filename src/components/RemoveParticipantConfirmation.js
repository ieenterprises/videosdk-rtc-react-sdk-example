
import React from 'react';

export const RemoveParticipantConfirmation = ({
  participantName,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-4 rounded-lg max-w-md w-full">
        <h3 className="text-white text-lg font-semibold mb-4">Remove Participant</h3>
        <p className="text-white mb-6">
          Are you sure you want to remove {participantName} from the meeting?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
