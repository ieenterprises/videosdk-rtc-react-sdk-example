import { CheckIcon, ClipboardIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { toast } from "react-toastify";

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

  return (
    <div className="flex flex-1 flex-col justify-center w-full p-6 bg-gray-100 rounded-xl shadow-lg"> {/* Added background, padding, and shadow */}
      {iscreateMeetingClicked ? (
        <div className="border border-solid border-gray-400 rounded-xl px-4 py-3  flex items-center justify-center mb-4"> {/* Added margin bottom */}
          <p className="text-gray-800 text-base font-medium"> {/* Improved text styling */}
            {`Meeting code : ${meetingId}`}
          </p>
          <button
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" {/* Improved button styling */}
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
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <>
          <input
            defaultValue={meetingId}
            onChange={(e) => {
              setMeetingId(e.target.value);
            }}
            placeholder={"Enter meeting Id"}
            className="px-4 py-3 bg-gray-200 rounded-xl text-gray-800 w-full text-center mb-2" {/* Improved input styling */}
          />
          {meetingIdError && (
            <p className="text-xs text-red-600 text-center"> {/* Centered error message */}
              {`Please enter a valid meetingId`}
            </p>
          )}
        </>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-3 mt-5 bg-gray-200 rounded-xl text-gray-800 w-full text-center mb-2" {/* Improved input styling */}
          />
          <button
            disabled={participantName.length < 3}
            className={`w-full ${participantName.length < 3 ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-700"} text-white font-bold py-2 px-4 rounded-xl mt-5`} {/* Improved button styling */}
            onClick={(e) => {
              if (iscreateMeetingClicked) {
                onClickStartMeeting();
              } else {
                if (meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
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
        <div className="w-full md:mt-0 mt-4 flex flex-col space-y-4"> {/* Added spacing */}
          <button
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl" {/* Improved button styling */}
            onClick={async (e) => {
              const { meetingId, err } = await _handleOnCreateMeeting();

              if (meetingId) {
                setMeetingId(meetingId);
                setIscreateMeetingClicked(true);
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
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl" {/* Improved button styling */}
            onClick={(e) => {
              setIsJoinMeetingClicked(true);
            }}
          >
            Join a meeting
          </button>
        </div>
      )}
    </div>
  );
}