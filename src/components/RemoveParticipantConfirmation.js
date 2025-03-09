
import React from "react";
import { useMeeting } from "@videosdk.live/react-sdk";

const RemoveParticipantConfirmation = ({ participantId, onClose }) => {
  const { remove } = useMeeting();

  const handleRemoveParticipant = () => {
    remove(participantId);
    onClose();
  };

  return (
    <div className="confirmation-dialog">
      <div className="confirmation-content">
        <h3>Remove Participant</h3>
        <p>Are you sure you want to remove this participant from the meeting?</p>
        <div className="confirmation-buttons">
          <button 
            onClick={handleRemoveParticipant}
            className="confirm-button"
            style={{ 
              backgroundColor: "#dc3545", 
              color: "white", 
              padding: "8px 16px", 
              border: "none",
              borderRadius: "4px",
              marginRight: "10px" 
            }}
          >
            Remove
          </button>
          <button 
            onClick={onClose}
            className="cancel-button"
            style={{ 
              backgroundColor: "#6c757d", 
              color: "white", 
              padding: "8px 16px", 
              border: "none",
              borderRadius: "4px" 
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipantConfirmation;
