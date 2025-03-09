import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RemoveParticipantConfirmation } from "../RemoveParticipantConfirmation";

const ParticipantListItem = ({ participantId, isHost }) => {
  const { participants } = useMeeting();
  const participant = useMemo(
    () => participants.get(participantId),
    [participants, participantId]
  );

  const { displayName } = participant;

  const { removeParticipant } = useMeeting();

  const handleRemoveParticipant = () => {
    if (isHost && participantId !== isHost) {
      removeParticipant(participantId);
    }
  };

  return (
    <div
      className="mt-2 m-1 p-2 bg-gray-700 rounded-lg mb-0"
      key={`participant_${participantId}`}
    >
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center">
          <p className="text-base text-white">{displayName || participantId}</p>
        </div>
        <div className="flex items-center justify-center">
          {isHost && participantId !== isHost && (
            <button
              className="text-white bg-red-500 p-1 mx-1 rounded hover:bg-red-600"
              onClick={handleRemoveParticipant}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export function ParticipantPanel({ panelHeight }) {
  const mMeeting = useMeeting();
  const { localParticipant, participants } = mMeeting;

  const participantIds = useMemo(() => {
    const localId = localParticipant?.id;
    const remoteIds = [...participants.keys()].filter(
      (id) => id !== localId
    );
    return [localId, ...remoteIds].filter(Boolean);
  }, [participants, localParticipant]);

  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: panelHeight - 14 }}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          {participantIds.map((participantId) => {
            return (
              <ParticipantListItem 
                key={participantId}
                participantId={participantId}
                isHost={localParticipant?.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}