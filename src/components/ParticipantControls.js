
import React from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { OutlinedButton } from "./buttons/OutlinedButton";
import { useMeetingAppContext } from "../MeetingAppContextDef";

export function ParticipantControls({ participantId }) {
  const { isMeetingCreator } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const { micOn, webcamOn, isLocal } = useParticipant(participantId);

  // Don't show controls for local participant or if not meeting creator
  if (isLocal || !isMeetingCreator) return null;

  const toggleParticipantMic = () => {
    mMeeting.muteMic(participantId, !micOn);
  };

  const toggleParticipantWebcam = () => {
    mMeeting.disableWebcam(participantId, webcamOn);
  };

  const removeParticipant = () => {
    mMeeting.remove(participantId);
  };

  return (
    <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-center space-x-2">
      <OutlinedButton
        onClick={toggleParticipantMic}
        tooltip={micOn ? "Mute participant" : "Unmute participant"}
        small
      >
        {micOn ? "Mute" : "Unmute"}
      </OutlinedButton>
      
      <OutlinedButton
        onClick={toggleParticipantWebcam}
        tooltip={webcamOn ? "Disable camera" : "Enable camera"}
        small
      >
        {webcamOn ? "Disable Cam" : "Enable Cam"}
      </OutlinedButton>
      
      <OutlinedButton
        onClick={removeParticipant}
        tooltip="Remove participant"
        danger
        small
      >
        Remove
      </OutlinedButton>
    </div>
  );
}
