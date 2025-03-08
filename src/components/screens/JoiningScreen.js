import React, { useEffect, useRef, useState, useCallback } from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import ConfirmBox from "../ConfirmBox";
import { Constants, useMediaDevice } from "@videosdk.live/react-sdk";
import useMediaStream from "../../hooks/useMediaStream";
import useIsMobile from "../../hooks/useIsMobile";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicPermissionDenied from "../../icons/MicPermissionDenied";
import CameraPermissionDenied from "../../icons/CameraPermissionDenied";
import DropDown from "../DropDown";
import DropDownCam from "../DropDownCam";
import DropDownSpeaker from "../DropDownSpeaker";
import NetworkStats from "../NetworkStats";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { toast } from "react-toastify";

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

  function onDeviceChanged() {
    setDidDeviceChange((oldState) => !oldState);
  }

  useEffect(() => {
    const permission = async () => {
      const permission = await checkPermissions();
      permissonAvaialble.current = permission;
      setIsCameraPermissionAllowed(permission.video);
      setIsMicrophonePermissionAllowed(permission.audio);
    };
    permission();
  }, []);

  useEffect(() => {
    const getSelectedMediaDevice = async () => {
      try {
        const cameras = await getCameras({ checkPermission: true });
        const microphones = await getMicrophones({ checkPermission: true });
        const speakers = await getPlaybackDevices({ checkPermission: true });

        setDevices({ webcams: cameras, mics: microphones, speakers });
      } catch (err) {
        console.log(err);
      }
    };
    getSelectedMediaDevice();
  }, [didDeviceChange]);

  const createMeetingHandler = useCallback(async () => {
    const token = await getToken();
    const _meetingId = await createMeeting({ token });
    setToken(token);
    setMeetingId(_meetingId);
    onClickStartMeeting();
  }, []);

  const validateSetRatio = () => {
    const size = videoPlayerRef.current?.getBoundingClientRect();
    if (size) {
      videoPlayerRef.current.style.height = `${(size.width / 16) * 9}px`;
    }
  };

  const getVideo = async () => {
    let track;
    if (selectedWebcam?.id) {
      track = await getVideoTrack({
        webcamId: selectedWebcam.id,
        encoderConfig: "h720p_w1280p",
      });
    } else {
      track = await getVideoTrack({
        encoderConfig: "h720p_w1280p",
      });
    }

    if (!track) {
      setWebcamOn(false);
      return;
    }

    const camera = {
      id: track.getSettings().deviceId,
    };

    setCustomVideoStream(null);
    setVideoTrack(track);
    setSelectedWebcam(camera);
    setWebcamOn(true);
  };

  const getAudio = async () => {
    let track;
    if (selectedMic?.id) {
      track = await getAudioTrack({
        microphoneId: selectedMic.id,
        encoderConfig: "high_quality",
      });
    } else {
      track = await getAudioTrack({
        encoderConfig: "high_quality",
      });
    }

    if (!track) {
      setMicOn(false);
      return;
    }

    const mic = {
      id: track.getSettings().deviceId,
    };

    setAudioTrack(track);
    setSelectedMic(mic);
    setMicOn(true);
    setCustomAudioStream(null);
  };

  const handleClickJoin = () => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(null);
    }
    if (audioTrack) {
      audioTrack.stop();
      setAudioTrack(null);
    }
  };

  useEffect(() => {
    if (videoPlayerRef.current?.offsetWidth && videoTrack) {
      setTimeout(() => {
        validateSetRatio();
        videoTrack.track && (videoPlayerRef.current.srcObject = videoTrack);
      }, 500);
    }
  }, [videoPlayerRef.current?.offsetWidth, videoTrack]);

  return (
    <div className="joining-screen-container">
      <div className="logo-container">
        <div className="logo">
          ie<span>VidMeet</span>
        </div>
      </div>

      <div className="joining-card">
        <h1 className="joining-title">Welcome to ieVidMeet</h1>
        <p className="joining-subtitle">
          Connect with crystal-clear audio and HD video quality
        </p>

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
          joining={handleClickJoin}
          createMeeting={createMeetingHandler}
        />

        <div className="feature-list">
          <div className="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>HD Video Quality</span>
          </div>
          <div className="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>Screen Sharing</span>
          </div>
          <div className="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>Chat Functionality</span>
          </div>
          <div className="feature-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>Secure Meetings</span>
          </div>
        </div>
      </div>
    </div>
  );
}