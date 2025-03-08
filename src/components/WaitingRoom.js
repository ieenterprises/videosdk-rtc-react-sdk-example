
import React, { useMemo, useEffect, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { CheckIcon, XIcon } from "@heroicons/react/outline";

export function WaitingRoom() {
  const mMeeting = useMeeting();
  const [waitingParticipants, setWaitingParticipants] = useState([]);
  
  // Check if current user is the meeting host
  const isHost = mMeeting.localParticipant.id === mMeeting.localParticipant.id;

  // Get participants in waiting room
  useEffect(() => {
    if (mMeeting.waitingRoomParticipants) {
      const participants = Object.values(mMeeting.waitingRoomParticipants);
      setWaitingParticipants(participants);
    }
  }, [mMeeting.waitingRoomParticipants]);

  // Function to admit a participant
  const admitParticipant = (participantId) => {
    mMeeting.acceptEntry(participantId);
  };

  // Function to deny a participant
  const denyParticipant = (participantId) => {
    mMeeting.rejectEntry(participantId);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-4">
      <h2 className="text-white text-lg font-semibold mb-4">Waiting Room</h2>
      
      {waitingParticipants.length === 0 ? (
        <p className="text-gray-400">No participants waiting</p>
      ) : (
        <div className="space-y-3">
          {waitingParticipants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
              <span className="text-white">{participant.displayName || "Unnamed"}</span>
              
              {isHost && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => admitParticipant(participant.id)}
                    className="p-1 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="h-5 w-5 text-white" />
                  </button>
                  <button 
                    onClick={() => denyParticipant(participant.id)}
                    className="p-1 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <XIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
