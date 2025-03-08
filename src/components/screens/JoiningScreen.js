import React, { useEffect, useRef, useState } from "react";
import {
  Constants,
  useMeeting,
  useMediaDevice,
  useMediaStream,
} from "@videosdk.live/react-sdk";
import useIsMobile from "../../hooks/useIsMobile";
import useIsTab from "../../hooks/useIsTab";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { useSnackbar } from "notistack";
import { VideocamOff, MicOff } from "@material-ui/icons";
import MicIcon from "@material-ui/icons/Mic";
import VideocamIcon from "@material-ui/icons/Videocam";
import { Tooltip } from "@material-ui/core";
import { ReactComponent as CopyIcon } from "../../icons/copy-icon.svg";
import { toast } from "react-toastify";
import { getToken } from "../../api";
import { createMeeting, validateMeeting } from "../../api";
import SettingDialogueBox from "../SettingDialogueBox";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/WebcamOnIcon";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/MicOnIcon";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  onClickStartMeeting,
  micOn,
  webcamOn,
  setWebcamOn,
  setMicOn,
  customAudioStream,
  setCustomAudioStream,
  setCustomVideoStream,
}) {
  const {
    selectedWebcam,
    selectedMic,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
  } = useMeetingAppContext();

  const [{ webcams, mics, speakers }, setDevices] = useState({
    webcams: [],
    mics: [],
    speakers: [],
  });
  const { getVideoTrack, getAudioTrack } = useMediaStream();
  const {
    checkPermissions,
    getCameras,
    getMicrophones,
    requestPermission,
    getPlaybackDevices,
  } = useMediaDevice({ onDeviceChanged });
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);
  const [didDeviceChange, setDidDeviceChange] = useState(false);

  const videoPlayerRef = useRef();
  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();
  const permissonAvaialble = useRef();
  const webcamRef = useRef();
  const micRef = useRef();
  const isMobile = useIsMobile();

  useEffect(() => {
    webcamRef.current = webcamOn;
  }, [webcamOn]);

  useEffect(() => {
    micRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    checkPermissions().then((permission) => {
      permissonAvaialble.current = permission;

      if (permission.video) {
        setIsCameraPermissionAllowed(true);
        getCameras()
          .then((cameras) => {
            setDevices((s) => ({ ...s, webcams: cameras }));
          })
          .catch(() => {
            setIsCameraPermissionAllowed(false);
          });
      } else {
        setIsCameraPermissionAllowed(false);
      }

      if (permission.audio) {
        setIsMicrophonePermissionAllowed(true);
        getMicrophones()
          .then((micros) => {
            setDevices((s) => ({ ...s, mics: micros }));
          })
          .catch(() => {
            setIsMicrophonePermissionAllowed(false);
          });
        getPlaybackDevices()
          .then((speakerDevices) => {
            setDevices((s) => ({ ...s, speakers: speakerDevices }));
          })
          .catch(() => {});
      } else {
        setIsMicrophonePermissionAllowed(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!webcamOn) {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
      }
      setCustomVideoStream(null);
      return;
    }
    if (!isCameraPermissionAllowed) {
      return;
    }
    if (!selectedWebcam?.id) {
      if (webcams.length) {
        setSelectedWebcam(webcams[0]);
      }
      return;
    }

    getVideoTrack(selectedWebcam.id)
      .then(async (stream) => {
        videoTrackRef.current = stream;
        setCustomVideoStream(stream);
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = new MediaStream([stream]);
          videoPlayerRef.current.play();
        }
        setVideoTrack(stream);
      })
      .catch((err) => {
        setWebcamOn(false);
        console.log("Error getting stream ", err);
      });
  }, [webcamOn, selectedWebcam, didDeviceChange, isCameraPermissionAllowed]);

  useEffect(() => {
    if (!micOn) {
      if (audioTrack) {
        audioTrack.stop();
        setAudioTrack(null);
      }
      setCustomAudioStream(null);
      return;
    }
    if (!isMicrophonePermissionAllowed) {
      return;
    }
    if (!selectedMic?.id) {
      if (mics.length) {
        setSelectedMic(mics[0]);
      }
      return;
    }

    getAudioTrack(selectedMic.id)
      .then(async (stream) => {
        audioTrackRef.current = stream;
        setCustomAudioStream(stream);
        setAudioTrack(stream);
      })
      .catch((err) => {
        setMicOn(false);
        console.log("Error getting stream ", err);
      });
  }, [micOn, selectedMic, didDeviceChange, isMicrophonePermissionAllowed]);

  const changeWebcam = (deviceId) => {
    webcams.forEach((webcam) => {
      if (webcam.id === deviceId) {
        setSelectedWebcam(webcam);
      }
    });
  };

  const changeMic = (deviceId) => {
    mics.forEach((mic) => {
      if (mic.id === deviceId) {
        setSelectedMic(mic);
      }
    });
  };

  const changeSpeaker = (deviceId) => {
    speakers.forEach((speaker) => {
      if (speaker.id === deviceId) {
        setSelectedSpeaker(speaker);
      }
    });
  };

  function onDeviceChanged(deviceId, deviceType) {
    console.log(deviceId, deviceType);
    if (deviceType === "videoinput") {
      const webcam = { id: deviceId };
      console.log(webcam);
      setSelectedWebcam(webcam);
    } else if (deviceType === "audioinput") {
      const mic = { id: deviceId };
      setSelectedMic(mic);
    }
  }

  function handleClickOpen() {
    setDlgMuted(true);
  }

  function handleClose() {
    setDlgMuted(false);
  }

  function openDeviceSelectionDlg() {
    setDlgDevices(true);
  }

  function closeDeviceSelectionDlg() {
    setDlgDevices(false);
  }

  // Load Tawk.to script
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/6616a163a0c6737bd12a56c8/1hr46cts6';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Transparent Header with Logo */}
      <header className="bg-transparent flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-blue-600">ieVidMeet</h1>
        </div>
        <div className="text-gray-600 text-sm">
          <a href="#" className="mr-4 hover:text-blue-600">About</a>
          <a href="#" className="mr-4 hover:text-blue-600">Features</a>
          <a href="#" className="hover:text-blue-600">Help</a>
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-12 grid-cols-1">
        {/* Left side - Video Preview */}
        <div className="md:col-span-7 bg-gray-50 p-8 flex items-center justify-center">
          <div className="relative max-w-lg w-full rounded-xl overflow-hidden shadow-lg bg-white p-6">
            <h2 className="text-2xl font-semibold text-center mb-6">Camera Preview</h2>

            <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video mb-4">
              {webcamOn ? (
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={videoPlayerRef}
                  controls={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideocamOff className="text-white" style={{ fontSize: 40 }} />
                </div>
              )}

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button
                  className={`p-3 rounded-full ${micOn ? "bg-blue-600" : "bg-red-600"}`}
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? (
                    <MicIcon className="text-white" />
                  ) : (
                    <MicOff className="text-white" />
                  )}
                </button>

                <button
                  className={`p-3 rounded-full ${webcamOn ? "bg-blue-600" : "bg-red-600"}`}
                  onClick={() => setWebcamOn(!webcamOn)}
                >
                  {webcamOn ? (
                    <VideocamIcon className="text-white" />
                  ) : (
                    <VideocamOff className="text-white" />
                  )}
                </button>

                <button
                  className="p-3 rounded-full bg-gray-700"
                  onClick={openDeviceSelectionDlg}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Join Form */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ieVidMeet</h1>
              <p className="text-gray-600 text-lg">Exclusive Private Video Chat for Code Calls</p>
            </div>

            <MeetingDetailsScreen
              participantName={participantName}
              setParticipantName={setParticipantName}
              videoTrack={videoTrack}
              setVideoTrack={setVideoTrack}
              onClickStartMeeting={onClickStartMeeting}
              onClickJoin={async (id) => {
                const token = await getToken();
                const { meetingId, err } = await validateMeeting({
                  roomId: id,
                  token,
                });
                if (meetingId === id) {
                  setToken(token);
                  setMeetingId(id);
                  onClickStartMeeting();
                } else {
                  toast(`${err}`, {
                    position: "bottom-left",
                    autoClose: 4000,
                    hideProgressBar: true,
                    closeButton: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
              }}
              _handleOnCreateMeeting={async () => {
                const token = await getToken();
                const _meetingId = await createMeeting({ token });
                setToken(token);
                setMeetingId(_meetingId);
                onClickStartMeeting();
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer with additional info */}
      <footer className="bg-gray-50 py-8 text-center border-t border-gray-200">
        <p className="text-gray-600 mb-2">Secure, HD quality video conferencing for professionals</p>
        <p className="text-gray-500 text-sm">© 2023 ieVidMeet. All rights reserved.</p>
      </footer>

      {/* Settings Dialog */}
      <SettingDialogueBox
        open={dlgDevices}
        onClose={closeDeviceSelectionDlg}
        popupPlacement={isMobile ? "bottom" : "right"}
        webcams={webcams}
        mics={mics}
        speakers={speakers}
        setSelectedWebcam={changeWebcam}
        setSelectedMic={changeMic}
        setSelectedSpeaker={changeSpeaker}
        selectedWebcam={selectedWebcam}
        selectedMic={selectedMic}
        selectedSpeaker={selectedSpeaker}
        setDidDeviceChange={setDidDeviceChange}
      />
    </div>
  );
}