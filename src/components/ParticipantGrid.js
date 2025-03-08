import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";
import { useMeeting } from "@videosdk.live/react-sdk";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

export function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  const meeting = useMeeting();
  const isHost = meeting.localParticipant.id === meeting.localParticipant.id;

  // Configuration based on number of participants
  const cols = participantIds.length < 2 ? 1 : participantIds.length < 5 ? 2 : 3;
  const rows = Math.ceil(participantIds.length / cols);

  return (
    <div
      className={`grid overflow-hidden flex-1 ${
        cols === 1
          ? "grid-cols-1"
          : cols === 2
          ? "grid-cols-2"
          : "grid-cols-3"
      } ${rows === 1 ? "grid-rows-1" : "grid-rows-2"} gap-4`}
    >
      {participantIds?.map((participantId) => (
        <div
          key={participantId}
          className={`bg-gray-750 rounded-lg overflow-hidden relative ${
            isPresenting
              ? participantIds?.length === 1
                ? "h-40 w-40"
                : "h-32 w-44"
              : "w-full h-full"
          }`}
        >
          <MemoizedParticipant
            participantId={participantId}
            showHostControls={isHost && participantId !== meeting.localParticipant.id}
          />
        </div>
      ))}
    </div>
  );
}