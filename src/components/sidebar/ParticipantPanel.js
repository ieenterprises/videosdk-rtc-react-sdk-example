import React, { useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiUserX } from "react-icons/fi";
import RemoveParticipantConfirmation from "../RemoveParticipantConfirmation";

function ParticipantListItem({ participantId }) {
  const { localParticipant, removeParticipant } = useMeeting({});
  const {
    displayName,
    webcamOn,
    micOn,
    isLocal,
    enableMic,
    disableMic,
    enableWebcam,
    disableWebcam,
  } = useParticipant(participantId);

  const isHost = localParticipant?.mode?.permissions?.canRemoveOtherParticipant;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRemoveParticipant = () => {
    removeParticipant(participantId);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
            <p className="text-sm">{displayName?.charAt(0)?.toUpperCase()}</p>
          </div>
          <p>
            {displayName} {isLocal ? "(You)" : ""}
          </p>
        </div>
        {!isLocal && isHost && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => (micOn ? disableMic() : enableMic())}
              className="p-1 rounded-full hover:bg-gray-800"
              title={micOn ? "Disable Mic" : "Enable Mic"}
            >
              {micOn ? <FiMic /> : <FiMicOff />}
            </button>
            <button
              onClick={() => (webcamOn ? disableWebcam() : enableWebcam())}
              className="p-1 rounded-full hover:bg-gray-800"
              title={webcamOn ? "Disable Camera" : "Enable Camera"}
            >
              {webcamOn ? <FiVideo /> : <FiVideoOff />}
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="p-1 rounded-full hover:bg-red-800"
              title="Remove Participant"
            >
              <FiUserX />
            </button>
          </div>
        )}
      </div>
      <RemoveParticipantConfirmation
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        participantName={displayName}
        onConfirm={handleRemoveParticipant}
      />
    </>
  );
}

export function ParticipantPanel({ panelHeight }) {
  const { participants } = useMeeting();
  const participantIds = [...participants.keys()];

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: panelHeight - 100 }}
    >
      <div className="flex flex-col">
        {participantIds.map((participantId) => (
          <ParticipantListItem 
            key={participantId}
            participantId={participantId} 
          />
        ))}
      </div>
    </div>
  );
}