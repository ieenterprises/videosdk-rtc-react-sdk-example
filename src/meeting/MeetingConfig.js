
import { Constants } from "@videosdk.live/react-sdk";
import { useMemo } from "react";

export const useMeetingConfig = () => {
  const configMeeting = useMemo(
    () => ({
      defaultRenderer: "browser",
      autoConsume: true,
      notifications: {
        participant: {
          joined: true,
          left: true,
          participantJoinedNotificationHTML: (participantName) => {
            return `<div>${participantName} joined the meeting</div>`;
          },
          participantLeftNotificationHTML: (participantName) => {
            return `<div>${participantName} left the meeting</div>`;
          },
        },
      },
      layout: {
        type: Constants.meeting.layout.GRID,
        gridSize: 4,
      },
      resolution: "sd",
      joinWithoutUserInteraction: false,
      preferredParticipantRoles: ['host', 'guest'],
      permissions: {
        changeLayout: true,
        toggleParticipantWebcam: true,
        toggleParticipantMic: true,
        removeParticipant: true,
        endMeeting: true,
        drawOnWhiteboard: true,
        toggleWhiteboard: true,
        toggleRecording: true,
        toggleLivestream: true,
        pin: true,
        changeRole: true,
      },
    }),
    []
  );

  return { configMeeting };
};
