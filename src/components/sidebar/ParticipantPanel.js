import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useMemo, useState } from "react";
import MicOffIcon from "../../icons/ParticipantTabPanel/MicOffIcon";
import MicOnIcon from "../../icons/ParticipantTabPanel/MicOnIcon";
import RaiseHand from "../../icons/ParticipantTabPanel/RaiseHand";
import VideoCamOffIcon from "../../icons/ParticipantTabPanel/VideoCamOffIcon";
import VideoCamOnIcon from "../../icons/ParticipantTabPanel/VideoCamOnIcon";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { nameTructed } from "../../utils/helper";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash,
  FaSignOutAlt
} from "react-icons/fa";
import { RemoveParticipantConfirmation } from "../../components/RemoveParticipantConfirmation";

function ParticipantListItem({ participantId, raisedHand }) {
  const { participant, removeParticipant, enableMic, disableMic, enableWebcam, disableWebcam } = useParticipant(participantId);
  const { micOn, webcamOn, isLocal, displayName } = participant;
  const { localParticipant } = useMeeting();
  const isAdmin = localParticipant?.isHost || localParticipant?.presenterId;
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const isHost = participant?.isHost;

  const handleRemoveParticipant = () => {
    if (isAdmin && !isLocal) {
      setShowRemoveConfirmation(true);
    }
  };

  const confirmRemoveParticipant = () => {
    removeParticipant();
    setShowRemoveConfirmation(false);
  };

  const cancelRemoveParticipant = () => {
    setShowRemoveConfirmation(false);
  };

  const handleToggleMic = () => {
    if (isAdmin && !isLocal) {
      micOn ? disableMic() : enableMic();
    }
  };

  const handleToggleWebcam = () => {
    if (isAdmin && !isLocal) {
      webcamOn ? disableWebcam() : enableWebcam();
    }
  };

  return (
    <div className="mt-2 m-2 p-2 bg-gray-700 rounded-lg mb-0">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center">
          <p className="text-base text-white">{displayName}</p>
          {isLocal && <span className="ml-2 text-xs text-gray-400">(You)</span>}
          {isHost && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Host</span>}
        </div>
        <div className="flex items-center">
          {micOn ? (
            <FaMicrophone size={20} className="text-white" />
          ) : (
            <FaMicrophoneSlash size={20} className="text-white" />
          )}
          {webcamOn ? (
            <FaVideo size={20} className="text-white ml-1" />
          ) : (
            <FaVideoSlash size={20} className="text-white ml-1" />
          )}

          {isAdmin && !isLocal && (
            <div className="flex ml-2">
              <button 
                onClick={handleToggleMic} 
                className="p-1 bg-gray-600 rounded-md mx-1 hover:bg-gray-500 transition-colors duration-200"
                title={micOn ? "Mute participant" : "Unmute participant"}
                aria-label={micOn ? "Mute participant" : "Unmute participant"}
              >
                {micOn ? <FaMicrophoneSlash size={14} className="text-red-500" /> : <FaMicrophone size={14} className="text-green-500" />}
              </button>
              <button 
                onClick={handleToggleWebcam} 
                className="p-1 bg-gray-600 rounded-md mx-1 hover:bg-gray-500 transition-colors duration-200"
                title={webcamOn ? "Turn off participant camera" : "Turn on participant camera"}
                aria-label={webcamOn ? "Turn off participant camera" : "Turn on participant camera"}
              >
                {webcamOn ? <FaVideoSlash size={14} className="text-red-500" /> : <FaVideo size={14} className="text-green-500" />}
              </button>
              <button 
                onClick={handleRemoveParticipant} 
                className="p-1 bg-red-600 rounded-md ml-1 hover:bg-red-700 transition-colors duration-200"
                title="Remove participant from meeting"
                aria-label="Remove participant from meeting"
              >
                <FaSignOutAlt size={14} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
      {showRemoveConfirmation && (
        <RemoveParticipantConfirmation
          participantName={displayName}
          onConfirm={confirmRemoveParticipant}
          onCancel={cancelRemoveParticipant}
        />
      )}
    </div>
  );
}

export function ParticipantPanel({ panelHeight }) {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const participants = mMeeting.participants;

  const sortedRaisedHandsParticipants = useMemo(() => {
    const participantIds = [...participants.keys()];

    const notRaised = participantIds.filter(
      (pID) =>
        raisedHandsParticipants.findIndex(
          ({ participantId: rPID }) => rPID === pID
        ) === -1
    );

    const raisedSorted = raisedHandsParticipants.sort((a, b) => {
      if (a.raisedHandOn > b.raisedHandOn) {
        return -1;
      }
      if (a.raisedHandOn < b.raisedHandOn) {
        return 1;
      }
      return 0;
    });

    const combined = [
      ...raisedSorted.map(({ participantId: p }) => ({
        raisedHand: true,
        participantId: p,
      })),
      ...notRaised.map((p) => ({ raisedHand: false, participantId: p })),
    ];

    return combined;
  }, [raisedHandsParticipants, participants]);

  const filterParticipants = (sortedRaisedHandsParticipants) =>
    sortedRaisedHandsParticipants;

  const part = useMemo(
    () => filterParticipants(sortedRaisedHandsParticipants, participants),

    [sortedRaisedHandsParticipants, participants]
  );

  return (
    <div
      className={`flex w-full flex-col bg-gray-750 overflow-y-auto `}
      style={{ height: panelHeight }}
    >
      <div
        className="flex flex-col flex-1"
        style={{ height: panelHeight - 100 }}
      >
        {[...participants.keys()].map((participantId, index) => {
          const { raisedHand, participantId: peerId } = part[index];
          return (
            <ParticipantListItem
              key={peerId}
              participantId={peerId}
              raisedHand={raisedHand}
            />
          );
        })}
      </div>
    </div>
  );
}