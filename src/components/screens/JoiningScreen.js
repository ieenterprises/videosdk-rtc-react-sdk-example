import React, { useState, useEffect, useRef, useMemo } from "react";
import OutlinedButton from "../../components/buttons/OutlinedButton";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { createMeeting, validateMeeting } from "../../api";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useHistory } from "react-router-dom";
import { meetingTypes } from "../../utils/common";
import SendIcon from "../../icons/SendIcon";
import CustomButton from "../../components/buttons/CustomButton";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { trimSnackBarText } from "../../utils/helper";

const JoiningScreen = () => {
  const history = useHistory();
  const isMobile = useIsMobile();
  const isTab = useIsTab();

  const [isCreateMeetingClicked, setIsCreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);

  const [meetingId, setMeetingId] = useState("");
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isMeetingIdLoading, setIsMeetingIdLoading] = useState(false);

  const {
    participantName,
    setParticipantName,
    setMeetingMode,
    setMeetingType,
    setSelectedMic,
    setSelectedWebcam,
    webcams,
    mics,
    setMeetingTypeTitle,
  } = useMeetingAppContext();

  const participantNameRef = useRef();

  useEffect(() => {
    participantNameRef.current?.focus();
  }, []);

  const isJoinDisabled = useMemo(() => {
    return !participantName.trim() || (!isCreateMeetingClicked && !meetingId);
  }, [participantName, meetingId, isCreateMeetingClicked]);

  const handleJoin = async () => {
    if (isJoinDisabled) return;

    if (isCreateMeetingClicked) {
      handleCreateMeeting();
    } else if (meetingId) {
      handleJoinMeeting();
    }
  };

  const handleParticipantName = (e) => {
    setParticipantName(e.target.value);
  };

  const handleMeetingId = (e) => {
    setMeetingId(e.target.value);
    setMeetingIdError(false);
  };

  const handleCreateMeeting = async () => {
    try {
      const meetingId = await createMeeting();
      if (meetingId) {
        handleJoinMeetingType(meetingId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinMeeting = async () => {
    if (meetingId) {
      try {
        setIsMeetingIdLoading(true);
        const valid = await validateMeeting(meetingId);
        if (valid) {
          handleJoinMeetingType(meetingId);
        } else {
          setMeetingIdError(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsMeetingIdLoading(false);
      }
    }
  };

  const handleJoinMeetingType = (id) => {
    setMeetingType("MEETING");
    setMeetingTypeTitle("Meeting");
    setMeetingMode(meetingTypes.CONFERENCE);
    if (webcams.length > 0) {
      setSelectedWebcam(webcams[0].deviceId);
    }
    if (mics.length > 0) {
      setSelectedMic(mics[0].deviceId);
    }
    history.push(`/preview/${id}`);
  };

  const handleToggleCreateOrJoin = (createMeeting) => {
    setIsCreateMeetingClicked(createMeeting);
    setIsJoinMeetingClicked(!createMeeting);
    setMeetingIdError(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isJoinDisabled) {
      handleJoin();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* Left Panel - Hero Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Welcome to ieVidMeet</h1>
          <p className="text-lg text-gray-100 mb-10 leading-relaxed">
            Experience seamless video conferencing with crystal-clear audio and HD video quality. 
            Connect with colleagues, friends, and family anywhere in the world with our secure platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-5 rounded-lg border border-white border-opacity-20">
              <div className="text-white text-xl mb-2">HD Video</div>
              <p className="text-gray-200">Crystal clear video with adaptive quality for any connection</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-5 rounded-lg border border-white border-opacity-20">
              <div className="text-white text-xl mb-2">Secure</div>
              <p className="text-gray-200">End-to-end encrypted meetings for your privacy</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-5 rounded-lg border border-white border-opacity-20">
              <div className="text-white text-xl mb-2">Screen Sharing</div>
              <p className="text-gray-200">Share your screen with participants in real-time</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-5 rounded-lg border border-white border-opacity-20">
              <div className="text-white text-xl mb-2">Chat</div>
              <p className="text-gray-200">Send messages during your meeting without interruption</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Join Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Start or Join a Meeting</h2>
            <p className="text-gray-600">Connect with your team in seconds</p>
          </div>

          <div className="mb-6">
            <div className="flex mb-6 border rounded-lg overflow-hidden">
              <button 
                className={`flex-1 py-3 font-medium ${isCreateMeetingClicked ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleToggleCreateOrJoin(true)}
              >
                Create Meeting
              </button>
              <button 
                className={`flex-1 py-3 font-medium ${isJoinMeetingClicked ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleToggleCreateOrJoin(false)}
              >
                Join Meeting
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ref={participantNameRef}
                value={participantName}
                onChange={handleParticipantName}
                onKeyDown={handleKeyDown}
              />
            </div>

            {!isCreateMeetingClicked && (
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Meeting ID
                </label>
                <input
                  type="text"
                  placeholder="Enter meeting ID"
                  className={`w-full px-4 py-3 rounded-lg border ${meetingIdError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={meetingId}
                  onChange={handleMeetingId}
                  onKeyDown={handleKeyDown}
                />
                {meetingIdError && (
                  <p className="text-red-500 text-sm mt-1">Invalid meeting ID</p>
                )}
              </div>
            )}

            <button
              className={`w-full py-3 px-4 mt-2 rounded-lg flex items-center justify-center font-medium ${
                isJoinDisabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              onClick={handleJoin}
              disabled={isJoinDisabled}
            >
              {isMeetingIdLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isCreateMeetingClicked ? 'Create & Join' : 'Join Meeting'}
                  <SendIcon className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="text-gray-800 font-medium mb-2">Quick Tips</h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Test your audio and video before joining
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Use a headset for better audio quality
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Find a quiet place with good lighting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoiningScreen;