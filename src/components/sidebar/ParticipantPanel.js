import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MdOutlineClose } from "react-icons/md";
import { SearchIcon } from "../../icons";
import useIsTrackEnabled from "../../hooks/useIsTrackEnabled";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/MicOnIcon";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/WebcamOnIcon";
import RemoveParticipantConfirmation from "../RemoveParticipantConfirmation";

const ParticipantPanel = ({ panelHeight }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState(null);
  const [showRemoveParticipantConfirmation, setShowRemoveParticipantConfirmation] = useState(false);

  const mMeeting = useMeeting();
  const participants = mMeeting?.participants;
  const localParticipantId = mMeeting?.localParticipant?.id;
  const isHost = mMeeting?.localParticipant?.role === "host";

  const filterParticipants = useMemo(() => {
    const searchTextLowerCase = searchText.toLowerCase();
    const participantsArray = Array.from(participants?.values() || []);

    return participantsArray.filter(
      (participant) =>
        participant?.displayName?.toLowerCase().includes(searchTextLowerCase) ||
        participant?.id?.toLowerCase().includes(searchTextLowerCase)
    );
  }, [participants, searchText]);

  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipantId(participantId);
    setShowRemoveParticipantConfirmation(true);
  };

  return (
    <div
      className={`flex flex-col w-full bg-gray-800 overflow-hidden`}
      style={{ height: panelHeight }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <p className="text-white font-bold">Participants</p>
        <p className="text-white bg-gray-700 p-1 px-3 rounded-full text-sm">
          {mMeeting?.participants ? mMeeting?.participants.size : 0}
        </p>
      </div>
      <div className="px-4 pb-2">
        <div className="flex items-center bg-gray-750 rounded-lg px-2 py-1">
          <SearchIcon className="h-5 w-5 text-white" />
          <input
            type="text"
            className="bg-transparent text-white text-sm p-1 border-none focus:outline-none focus:ring-0 w-full"
            placeholder="Search for participants"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div
        className="flex flex-col overflow-y-auto overflow-x-hidden"
        style={{ height: panelHeight - 116 }}
      >
        <div className="flex flex-1 flex-col mt-1">
          {filterParticipants.map((participant) => {
            return (
              <ParticipantListItem
                key={participant.id}
                participant={participant}
                isLocal={participant.id === localParticipantId}
                canControl={isHost && participant.id !== localParticipantId}
                onRemove={() => handleRemoveParticipant(participant.id)}
              />
            );
          })}
        </div>
      </div>
      {showRemoveParticipantConfirmation && (
        <RemoveParticipantConfirmation
          participantId={selectedParticipantId}
          onClose={() => setShowRemoveParticipantConfirmation(false)}
        />
      )}
    </div>
  );
};

function ParticipantListItem({ participant, isLocal, canControl, onRemove }) {
  const { id, displayName } = participant;
  const audioEnabled = useIsTrackEnabled(participant?.audioTrack);
  const videoEnabled = useIsTrackEnabled(participant?.videoTrack);
  const meeting = useMeeting();

  const toggleAudio = () => {
    if (canControl) {
      if (audioEnabled) {
        meeting.disableMic(id);
      } else {
        meeting.enableMic(id);
      }
    }
  };

  const toggleVideo = () => {
    if (canControl) {
      if (videoEnabled) {
        meeting.disableWebcam(id);
      } else {
        meeting.enableWebcam(id);
      }
    }
  };

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-750">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
          <p className="text-sm text-white">
            {displayName?.charAt(0)?.toUpperCase() || "A"}
          </p>
        </div>
        <div>
          <p className="text-sm text-white">{displayName || id}</p>
          <p className="text-xs text-gray-400">{isLocal ? "You" : ""}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canControl ? (
          <>
            <button 
              onClick={toggleAudio}
              className="text-white p-1 rounded-full hover:bg-gray-700"
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? (
                <MicOnIcon className="h-5 w-5 text-white" />
              ) : (
                <MicOffIcon className="h-5 w-5 text-white" />
              )}
            </button>
            <button 
              onClick={toggleVideo}
              className="text-white p-1 rounded-full hover:bg-gray-700"
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? (
                <WebcamOnIcon className="h-5 w-5 text-white" />
              ) : (
                <WebcamOffIcon className="h-5 w-5 text-white" />
              )}
            </button>
            <button
              onClick={onRemove}
              className="text-white p-1 rounded-full hover:bg-red-500"
              title="Remove participant"
            >
              <MdOutlineClose className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <div>
              {audioEnabled ? (
                <MicOnIcon className="h-5 w-5 text-white" />
              ) : (
                <MicOffIcon className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              {videoEnabled ? (
                <WebcamOnIcon className="h-5 w-5 text-white" />
              ) : (
                <WebcamOffIcon className="h-5 w-5 text-white" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ParticipantPanel;