import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useMemo } from "react";
import MicOffIcon from "../../icons/ParticipantTabPanel/MicOffIcon";
import MicOnIcon from "../../icons/ParticipantTabPanel/MicOnIcon";
import RaiseHand from "../../icons/ParticipantTabPanel/RaiseHand";
import VideoCamOffIcon from "../../icons/ParticipantTabPanel/VideoCamOffIcon";
import VideoCamOnIcon from "../../icons/ParticipantTabPanel/VideoCamOnIcon";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { nameTructed } from "../../utils/helper";

const ParticipantListItem = ({ participantId, raisedHand }) => {
  const { micOn, webcamOn, displayName, isLocal, enableMic, disableMic, enableWebcam, disableWebcam, remove } = useParticipant(
    participantId
  );
  const { localParticipantId } = useMeeting();
  const isHost = localParticipantId === participantId;

  const handleToggleMic = () => {
    if (micOn) {
      disableMic();
    } else {
      enableMic();
    }
  };

  const handleToggleWebcam = () => {
    if (webcamOn) {
      disableWebcam();
    } else {
      enableWebcam();
    }
  };

  const handleRemoveParticipant = () => {
    if (window.confirm(`Are you sure you want to remove ${displayName || 'this participant'}?`)) {
      remove();
    }
  };

  // Only show control buttons if you're not the one being controlled
  const showControls = !isLocal && isHost;

  return (
    <div className="mt-2 m-2 p-2 bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="text-base text-white ml-2">
            {isLocal ? "You" : nameTructed(displayName, 15)}
          </p>
        </div>
        <div className="flex items-center justify-center">
          {raisedHand && (
            <div className="ml-1 mr-1">
              <RaiseHand fillcolor="#fff" />
            </div>
          )}
          <div className="ml-1 mr-1">
            {micOn ? <MicOnIcon fillcolor="#fff" /> : <MicOffIcon />}
          </div>
          <div className="ml-1 mr-1">
            {webcamOn ? (
              <VideoCamOnIcon fillcolor="#fff" />
            ) : (
              <VideoCamOffIcon />
            )}
          </div>

          {showControls && (
            <>
              <button 
                onClick={handleToggleMic}
                className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                {micOn ? "Mute" : "Unmute"}
              </button>

              <button 
                onClick={handleToggleWebcam}
                className="ml-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                {webcamOn ? "Disable Cam" : "Enable Cam"}
              </button>

              <button 
                onClick={handleRemoveParticipant}
                className="ml-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
              participantId={peerId}
              raisedHand={raisedHand}
            />
          );
        })}
      </div>
    </div>
  );
}