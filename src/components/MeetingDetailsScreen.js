import { CheckIcon, ClipboardIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { toast } from "react-toastify";

// Added imports for participant control
import { useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";


export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  setParticipantName,
  onClickStartMeeting,
}) {
  const [meetingId, setMeetingId] = useState("");
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iscreateMeetingClicked, setIscreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");

  // Added hooks for meeting and participant management
  const meeting = useMeeting();
  const participants = meeting?.participants;


  const toggleParticipantAudio = (participantId) => {
    meeting?.toggleParticipantAudio(participantId);
  };

  const toggleParticipantVideo = (participantId) => {
    meeting?.toggleParticipantVideo(participantId);
  };


  return (
    <div
      className={`flex flex-1 flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5`}
    >
      {iscreateMeetingClicked ? (
        <div className="flex flex-col w-full gap-3">
          <div className="border border-solid border-gray-400 rounded-xl px-4 py-3 bg-white flex items-center justify-center">
            <p className="text-black text-base font-medium">
              {`Meeting code: ${meetingId}`}
            </p>
            <button
              className="ml-2"
              onClick={() => {
                navigator.clipboard.writeText(meetingId);
                setIsCopied(true);
                setTimeout(() => {
                  setIsCopied(false);
                }, 3000);
              }}
            >
              {isCopied ? (
                <CheckIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ClipboardIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </div>

          <div className="border border-solid border-gray-400 rounded-xl px-4 py-3 bg-white flex items-center justify-center">
            <p className="text-black text-base font-medium">
              {`Meeting link: ${window.location.origin}?meetingId=${meetingId}`}
            </p>
            <button
              className="ml-2"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?meetingId=${meetingId}`);
                toast("Meeting link copied!", {
                  position: "bottom-left",
                  autoClose: 4000,
                  hideProgressBar: true,
                  closeButton: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
              }}
            >
              <ClipboardIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          <button
            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-2"
            onClick={() => {
              setIscreateMeetingClicked(false);
              setMeetingId("");
            }}
          >
            Back to options
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <div className="flex flex-col w-full gap-3">
          <input
            defaultValue={meetingId}
            onChange={(e) => {
              setMeetingId(e.target.value);
            }}
            placeholder={"Enter meeting Id"}
            className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          {meetingIdError && (
            <p className="text-xs text-red-600">{`Please enter valid meetingId`}</p>
          )}

          <button
            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-2"
            onClick={() => {
              setIsJoinMeetingClicked(false);
              setMeetingId("");
            }}
          >
            Back to options
          </button>
        </div>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          {iscreateMeetingClicked && (
            <input
              value={meetingTitle || ""}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Title of the Meeting"
              className="px-4 py-3 mt-5 bg-gray-650 rounded-xl text-white w-full text-center"
            />
          )}
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-3 mt-5 bg-gray-650 rounded-xl text-white w-full text-center"
          />

          {/* <p className="text-xs text-white mt-1 text-center">
            Your name will help everyone identify you in the meeting.
          </p> */}
          <button
            disabled={participantName.length < 3}
            className={`w-full ${participantName.length < 3 ? "bg-gray-650" : "bg-purple-350"
              }  text-white px-2 py-3 rounded-xl mt-5`}
            onClick={(e) => {
              if (iscreateMeetingClicked) {
                onClickStartMeeting(meetingTitle);
              } else {
                if (meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
                  setMeetingIdError(false);
                  // Set a flag in localStorage to identify this user joined as a participant
                  localStorage.setItem("joinedMeetingId", meetingId);
                  if (localStorage.getItem("hostMeetingId") === meetingId) {
                    // User is joining their own meeting
                    localStorage.setItem("isHost", "true");
                  } else {
                    // User is joining someone else's meeting
                    localStorage.setItem("isHost", "false");
                  }
                  onClickJoin(meetingId);
                } else setMeetingIdError(true);
              }
            }}
          >
            {iscreateMeetingClicked ? "Start a meeting" : "Join a meeting"}
          </button>
        </>
      )}

      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="w-full md:mt-0 mt-4 flex flex-col">
          <div className="flex items-center justify-center flex-col w-full ">
            <button
              className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
              onClick={async (e) => {
                const { meetingId, err } = await _handleOnCreateMeeting();

                if (meetingId) {
                  setMeetingId(meetingId);
                  setIscreateMeetingClicked(true);
                  localStorage.setItem("hostMeetingId", meetingId); // Store the host's meeting ID
                  localStorage.setItem("isHost", "true"); //Mark the host
                } else {
                  toast(
                    `${err}`,
                    {
                      position: "bottom-left",
                      autoClose: 4000,
                      hideProgressBar: true,
                      closeButton: false,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                    }
                  );
                }
              }}
            >
              Create a meeting
            </button>
            <button
              className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
              onClick={(e) => {
                setIsJoinMeetingClicked(true);
              }}
            >
              Join a meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}