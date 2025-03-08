
import React, { useEffect, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { OutlinedButton } from "./buttons/OutlinedButton";

export const WaitingRoom = () => {
  const { isMeetingCreator } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const [waitingParticipants, setWaitingParticipants] = useState([]);

  useEffect(() => {
    const onParticipantJoinRequest = ({ participantId, name }) => {
      if (isMeetingCreator) {
        setWaitingParticipants((prev) => [
          ...prev,
          { id: participantId, name }
        ]);
      }
    };

    mMeeting.on("participant-join-request", onParticipantJoinRequest);

    return () => {
      mMeeting.off("participant-join-request", onParticipantJoinRequest);
    };
  }, [mMeeting, isMeetingCreator]);

  const acceptParticipant = (participantId) => {
    mMeeting.acceptParticipant(participantId);
    setWaitingParticipants((prev) => 
      prev.filter((p) => p.id !== participantId)
    );
  };

  const rejectParticipant = (participantId) => {
    mMeeting.rejectParticipant(participantId);
    setWaitingParticipants((prev) => 
      prev.filter((p) => p.id !== participantId)
    );
  };

  if (!isMeetingCreator || waitingParticipants.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 bg-gray-750 p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="text-white font-semibold mb-3">Waiting Room</h3>
      {waitingParticipants.map((participant) => (
        <div key={participant.id} className="mb-3 p-2 bg-gray-700 rounded">
          <p className="text-white mb-2">{participant.name || "Anonymous"}</p>
          <div className="flex justify-between">
            <OutlinedButton
              onClick={() => acceptParticipant(participant.id)}
              small
            >
              Accept
            </OutlinedButton>
            <OutlinedButton
              onClick={() => rejectParticipant(participant.id)}
              danger
              small
            >
              Reject
            </OutlinedButton>
          </div>
        </div>
      ))}
    </div>
  );
};
