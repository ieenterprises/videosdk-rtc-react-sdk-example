import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";
import { useMeeting } from "@videosdk.live/react-sdk";

export const ParticipantGrid = ({ participantIds }) => {
  const { isHost } = useMeetingAppContext();
  const meeting = useMeeting();

  return (
    <div className="flex flex-wrap content-start h-full">
      {participantIds.map((participantId) => (
        <div
          key={participantId}
          className={`flex w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2`}
        >
          <ParticipantView
            participantId={participantId}
            showControls={isHost && meeting.localParticipant.id !== participantId}
          />
        </div>
      ))}
    </div>
  );
};

export const MemoizedParticipantGrid = React.memo(ParticipantGrid);