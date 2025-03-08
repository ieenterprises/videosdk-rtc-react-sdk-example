
import React from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { MicrophoneIcon, VideoCameraIcon, XCircleIcon } from "@heroicons/react/outline";

export function ParticipantControls({ participantId }) {
  const meeting = useMeeting();
  const participant = useParticipant(participantId);
  const isLocalParticipant = participant?.isLocal;
  
  // Check if current user is the meeting host
  const isHost = meeting.localParticipant.id === meeting.meta?.hostId;
  
  // Only show controls if user is host and not controlling themselves
  if (!isHost || isLocalParticipant) return null;

  return (
    <div className="flex space-x-2">
      {/* Toggle Mic Button */}
      <button
        className={`p-1 rounded-full ${participant?.micOn ? "bg-gray-600" : "bg-red-600"}`}
        onClick={() => {
          if (participant?.micOn) {
            participant.disableMic();
          } else {
            participant.enableMic();
          }
        }}
      >
        <MicrophoneIcon className="h-4 w-4 text-white" />
      </button>
      
      {/* Toggle Camera Button */}
      <button
        className={`p-1 rounded-full ${participant?.webcamOn ? "bg-gray-600" : "bg-red-600"}`}
        onClick={() => {
          if (participant?.webcamOn) {
            participant.disableWebcam();
          } else {
            participant.enableWebcam();
          }
        }}
      >
        <VideoCameraIcon className="h-4 w-4 text-white" />
      </button>
      
      {/* Remove Participant Button */}
      <button
        className="p-1 rounded-full bg-red-600"
        onClick={() => {
          participant.remove();
        }}
      >
        <XCircleIcon className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
