import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

export function ParticipantView({ isPresenting }) {
  const { participants } = useMeeting();

  const participantIds = useMemo(() => {
    const participantIds = [...participants.keys()];
    return participantIds;
  }, [participants]);

  return (
    <div className={`h-full ${isPresenting ? "hidden" : ""}`}>
      <MemoizedParticipantGrid participantIds={participantIds} />
    </div>
  );
}