import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

export function ParticipantGrid({ participantIds }) {
  return (
    <div className="flex flex-wrap h-full">
      {participantIds?.map((participantId) => (
        <div
          key={participantId}
          className={`flex flex-1 min-w-[320px] h-1/${
            Math.min(4, Math.ceil(participantIds.length / 2))
          } p-1`}
        >
          <MemoizedParticipant participantId={participantId} />
        </div>
      ))}
    </div>
  );
}