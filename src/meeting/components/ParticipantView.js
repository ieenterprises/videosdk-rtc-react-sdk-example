import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";
import WaitingRoom from "./WaitingRoom"; // Assuming WaitingRoom component exists

function ParticipantsViewer({ isPresenting }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
    presenterId,
  } = useMeeting();

  const participantIds = useMemo(() => {
    const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
      (participantId) => {
        return participantId !== localParticipant.id;
      }
    );
    const regularParticipantIds = [...participants.keys()].filter(
      (participantId) => {
        return (
          ![...pinnedParticipants.keys()].includes(participantId) &&
          localParticipant.id !== participantId
        );
      }
    );

    const ids = [
      localParticipant.id,
      ...pinnedParticipantId,
      ...regularParticipantIds,
    ].slice(0, isPresenting ? 6 : 16);

    if (activeSpeakerId) {
      if (!ids.includes(activeSpeakerId)) {
        ids[ids.length - 1] = activeSpeakerId;
      }
    }
    return ids;
  }, [
    participants,
    activeSpeakerId,
    pinnedParticipants,
    presenterId,
    localScreenShareOn,
  ]);

  return (
    <div className="h-full w-full">
      <MemoizedParticipantGrid participantIds={participantIds} />
      <WaitingRoom />
    </div>
  );
}

const MemorizedParticipantView = React.memo(
  ParticipantsViewer,
  (prevProps, nextProps) => {
    return prevProps.isPresenting === nextProps.isPresenting;
  }
);

export default MemorizedParticipantView;