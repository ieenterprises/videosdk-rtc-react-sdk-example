import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useState } from "react";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";

const ParticipantControls = ({ participantId }) => {
  const { micOn, webcamOn, isLocal } = useParticipant(participantId);
  const { toggleRemoteMic, toggleRemoteWebcam } = useMeeting();
  const isHost = localStorage.getItem("isHost") === "true";

  const handleMicToggle = () => {
    if (!isLocal && isHost) {
      console.log(`Toggling mic for participant: ${participantId}, current state: ${micOn}`);
      toggleRemoteMic(participantId);
    }
  };

  const handleWebcamToggle = () => {
    if (!isLocal && isHost) {
      console.log(`Toggling webcam for participant: ${participantId}, current state: ${webcamOn}`);
      toggleRemoteWebcam(participantId);
    }
  };

  // Only allow host to control other participants' media
  const canControl = isHost && !isLocal;

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleMicToggle}
        disabled={!canControl}
        className={`p-1 rounded ${!canControl ? 'bg-gray-600' : (micOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600')}`}
        title={micOn ? "Mute Participant" : "Unmute Participant"}
      >
        <span className="text-xs text-white">{micOn ? "Mic On" : "Mic Off"}</span>
      </button>
      <button
        onClick={handleWebcamToggle}
        disabled={!canControl}
        className={`p-1 rounded ${!canControl ? 'bg-gray-600' : (webcamOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600')}`}
        title={webcamOn ? "Turn Off Camera" : "Turn On Camera"}
      >
        <span className="text-xs text-white">{webcamOn ? "Cam On" : "Cam Off"}</span>
      </button>
    </div>
  );
};

export const ParticipantPanel = ({ panelHeight }) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const { meetingId } = useMeeting();

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
                {participant.displayName || (isLocal ? "You" : "Guest")}
                {localStorage.getItem("isHost") === "true" && isLocal && 
                  <span className="ml-2 text-xs text-gray-400">(Meeting Host)</span>}
              </span>
              <div className="flex items-center space-x-2">
                <ParticipantControls participantId={participantId} />
                {!isLocal && localStorage.getItem("isHost") === "true" && (
                  <button
                    onClick={() => handleRemoveClick(participantId)}
                    className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
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