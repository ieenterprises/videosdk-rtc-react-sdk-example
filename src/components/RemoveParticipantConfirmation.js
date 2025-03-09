
import React from "react";

const RemoveParticipantConfirmation = ({
  isOpen,
  onClose,
  participantName,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Remove Participant
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to remove {participantName} from this meeting?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipantConfirmation;
