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
    <div
      className={`flex flex-1 flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5`}
    >
      {iscreateMeetingClicked ? (
        <div className="border border-solid border-gray-400 rounded-xl px-4 py-3  flex items-center justify-center">
          <p className="text-white text-base">
            {`Meeting code : ${meetingId}`}
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
            className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          {meetingIdError && (
            <p className="text-xs text-red-600">{`Please enter valid meetingId`}</p>
          )}
        </>
      ) : null}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl backdrop-filter backdrop-blur-sm border border-gray-700 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            {iscreateMeetingClicked ? "Start a New Meeting" : "Join an Existing Meeting"}
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm text-gray-300 mb-1 block">Your Name</label>
              <input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="px-4 py-3 bg-gray-700 rounded-xl text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-400 mt-1">
                Your name will help everyone identify you in the meeting.
              </p>
            </div>
            
            {isJoinMeetingClicked && (
              <div className="relative mt-4">
                <label className="text-sm text-gray-300 mb-1 block">Meeting ID</label>
                <input
                  value={meetingId}
                  onChange={(e) => {
                    setMeetingId(e.target.value);
                    setMeetingIdError(false);
                  }}
                  placeholder="xxxx-xxxx-xxxx"
                  className={`px-4 py-3 bg-gray-700 rounded-xl text-white w-full focus:outline-none focus:ring-2 ${
                    meetingIdError ? "border-red-500 focus:ring-red-500" : "focus:ring-purple-500"
                  } transition-all duration-200`}
                />
                {meetingIdError && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter a valid meeting ID (xxxx-xxxx-xxxx)
                  </p>
                )}
              </div>
            )}
            
            <button
              disabled={participantName.length < 3}
              className={`w-full ${
                participantName.length < 3 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transform hover:scale-105"
              } text-white px-4 py-3 rounded-xl mt-6 transition-all duration-200 font-medium`}
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
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {iscreateMeetingClicked ? "Start Meeting" : "Join Meeting"}
              </div>
            </button>
            
            <button
              className="w-full bg-transparent hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl border border-gray-600 mt-2 transition-all duration-200 text-sm"
              onClick={() => {
                setIscreateMeetingClicked(false);
                setIsJoinMeetingClicked(false);
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="w-full md:mt-0 mt-4 flex flex-col">
          <div className="flex items-center justify-center flex-col w-full space-y-4">
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-4 rounded-xl font-medium text-lg shadow-lg transform transition duration-200 hover:scale-105"
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
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Create a Meeting
              </div>
            </button>
            <div className="relative w-full flex items-center justify-center my-2">
              <div className="absolute border-t border-gray-600 w-full"></div>
              <div className="relative bg-transparent px-4">
                <span className="text-gray-400 text-sm">OR</span>
              </div>
            </div>
            <button
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-xl font-medium text-lg shadow-lg transform transition duration-200 hover:scale-105 border border-gray-700"
              onClick={(e) => {
                setIsJoinMeetingClicked(true);
              }}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Join a Meeting
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
