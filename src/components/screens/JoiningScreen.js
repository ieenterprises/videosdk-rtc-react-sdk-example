import React, { useEffect, useRef, useState } from "react";
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
import VideocamIcon from '../../icons/VideocamIcon';
import VideocamOffIcon from '../../icons/VideocamOffIcon';
import MicIcon from '../../icons/MicIcon';
import SettingsIcon from '../../icons/SettingsIcon';


// Placeholder for Header component - needs to be implemented
const Header = () => {
  return (
    <header className="bg-transparent">
      {/* Add your ieVidMeet logo here */}
      <div className="text-center py-4">
        <img src="/ievimeet-logo.png" alt="ieVidMeet Logo" className="h-12"/>
      </div>
    </header>
  );
};

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
    permissonAvaialble.current = {
      isCameraPermissionAllowed,
      isMicrophonePermissionAllowed,
    };
  }, [isCameraPermissionAllowed, isMicrophonePermissionAllowed]);

  useEffect(() => {
    if (micOn) {
      audioTrackRef.current = audioTrack;
      startMuteListener();
    }
  }, [micOn, audioTrack]);

  useEffect(() => {
    if (webcamOn) {

      // Close the existing video track if there's a new one
      if (videoTrackRef.current && videoTrackRef.current !== videoTrack) {
        videoTrackRef.current.stop(); // Stop the existing video track
      }

      videoTrackRef.current = videoTrack;

      var isPlaying =
        videoPlayerRef.current.currentTime > 0 &&
        !videoPlayerRef.current.paused &&
        !videoPlayerRef.current.ended &&
        videoPlayerRef.current.readyState >
        videoPlayerRef.current.HAVE_CURRENT_DATA;

      if (videoTrack) {
        const videoSrcObject = new MediaStream([videoTrack]);

        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = videoSrcObject;
          if (videoPlayerRef.current.pause && !isPlaying) {
            videoPlayerRef.current
              .play()
              .catch((error) => console.log("error", error));
          }
        }
      } else {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = null;
        }
      }
    }
  }, [webcamOn, videoTrack]);

  useEffect(() => {
    getCameraDevices();
  }, [isCameraPermissionAllowed]);

  useEffect(() => {
    getAudioDevices();
  }, [isMicrophonePermissionAllowed]);

  useEffect(() => {
    checkMediaPermission();
    return () => { };
  }, []);

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (webcamOn) {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
        setCustomVideoStream(null);
        setWebcamOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (micOn) {
      if (audioTrack) {
        audioTrack.stop();
        setAudioTrack(null);
        setCustomAudioStream(null);
        setMicOn(false);
      }
    } else {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };

  const changeWebcam = async (deviceId) => {
    if (webcamOn) {
      const currentvideoTrack = videoTrackRef.current;
      if (currentvideoTrack) {
        currentvideoTrack.stop();
      }

      const stream = await getVideoTrack({
        webcamId: deviceId,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks?.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };
  const changeMic = async (deviceId) => {


    if (micOn) {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      const stream = await getAudioTrack({
        micId: deviceId,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      clearInterval(audioAnalyserIntervalRef.current);
      setAudioTrack(audioTrack);
    }
  };

  const getDefaultMediaTracks = async ({ mic, webcam }) => {

    if (mic) {
      const stream = await getAudioTrack({
        micId: selectedMic.id,
      });
      setCustomAudioStream(stream);
      const audioTracks = stream?.getAudioTracks();
      const audioTrack = audioTracks.length ? audioTracks[0] : null;
      setAudioTrack(audioTrack);
    }

    if (webcam) {
      const stream = await getVideoTrack({
        webcamId: selectedWebcam.id,
      });
      setCustomVideoStream(stream);
      const videoTracks = stream?.getVideoTracks();
      const videoTrack = videoTracks?.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;
    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }
      currentAudioTrack.addEventListener("mute", (ev) => {
        setDlgMuted(true);
      });
    }
  }

  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  async function requestAudioVideoPermission(mediaType) {
    try {
      const permission = await requestPermission(mediaType);

      // For Video
      if (isFirefox) {
        const isVideoAllowed = permission.get("video");
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }

      // For Audio
      if (isFirefox) {
        const isAudioAllowed = permission.get("audio");
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.AUDIO) {
        const isAudioAllowed = permission.get(Constants.permission.AUDIO);
        setIsMicrophonePermissionAllowed(isAudioAllowed);
        if (isAudioAllowed) {
          setMicOn(true);
          await getDefaultMediaTracks({ mic: true, webcam: false });
        }
      }

      if (mediaType === Constants.permission.VIDEO) {
        const isVideoAllowed = permission.get(Constants.permission.VIDEO);
        setIsCameraPermissionAllowed(isVideoAllowed);
        if (isVideoAllowed) {
          setWebcamOn(true);
          await getDefaultMediaTracks({ mic: false, webcam: true });
        }
      }
    } catch (ex) {
      console.log("Error in requestPermission", ex);
    }
  }
  function onDeviceChanged() {
    setDidDeviceChange(true);
    getCameraDevices();
    getAudioDevices();
    getDefaultMediaTracks({ mic: micRef.current, webcam: webcamRef.current });
  }

  const checkMediaPermission = async () => {
    try {
      const checkAudioVideoPermission = await checkPermissions();
      const cameraPermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.VIDEO
      );
      const microphonePermissionAllowed = checkAudioVideoPermission.get(
        Constants.permission.AUDIO
      );

      setIsCameraPermissionAllowed(cameraPermissionAllowed);
      setIsMicrophonePermissionAllowed(microphonePermissionAllowed);

      if (microphonePermissionAllowed) {
        setMicOn(true);
        getDefaultMediaTracks({ mic: true, webcam: false });
      } else {
        await requestAudioVideoPermission(Constants.permission.AUDIO);
      }
      if (cameraPermissionAllowed) {
        setWebcamOn(true);
        getDefaultMediaTracks({ mic: false, webcam: true });
      } else {
        await requestAudioVideoPermission(Constants.permission.VIDEO);
      }
    } catch (error) {
      // For firefox, it will request audio and video simultaneously.
      await requestAudioVideoPermission();
      console.log(error);
    }
  };

  const getCameraDevices = async () => {
    try {
      if (permissonAvaialble.current?.isCameraPermissionAllowed) {
        let webcams = await getCameras();
        setSelectedWebcam({
          id: webcams[0]?.deviceId,
          label: webcams[0]?.label,
        });
        setDevices((devices) => {
          return { ...devices, webcams };
        });
      }
    } catch (err) {
      console.log("Error in getting camera devices", err);
    }
  };



  const getAudioDevices = async () => {
    try {
      if (permissonAvaialble.current?.isMicrophonePermissionAllowed) {
        let mics = await getMicrophones();
        console.log(mics)
        let speakers = await getPlaybackDevices();
        const hasMic = mics.length > 0;
        if (hasMic) {
          startMuteListener();
        }
        await setSelectedSpeaker({
          id: speakers[0]?.deviceId,
          label: speakers[0]?.label,
        });
        await setSelectedMic({ id: mics[0]?.deviceId, label: mics[0]?.label });
        setDevices((devices) => {
          return { ...devices, mics, speakers };
        });
      }
    } catch (err) {
      console.log("Error in getting audio devices", err);
    }
  };


  useEffect(() => {
    getAudioDevices()
  }, [])

  const ButtonWithTooltip = ({ onClick, onState, OnIcon, OffIcon }) => {
    const btnRef = useRef();
    return (
      <>
        <div>
          <button
            ref={btnRef}
            onClick={onClick}
            className={`rounded-full min-w-auto w-12 h-12 flex items-center justify-center 
            ${onState ? "bg-white" : "bg-red-650 text-white"}`}
          >
            {onState ? (
              <OnIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            ) : (
              <OffIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            )}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-white">
      {/* Header */}
      <Header />

      <div className="overflow-y-auto pt-16">
        <div className="flex min-h-screen flex-col">
          {/* Hero section */}
          <div className="text-center py-10 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-purple-600">ie</span><span className="text-blue-600">VidMeet</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              An exclusive private video chat platform for code calls
            </p>
          </div>

          <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 mb-12">
            {/* Preview section */}
            <div className="md:w-1/3 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-500">CAMERA PREVIEW</p>
                <div className="flex items-center justiy-center">
                  <SettingsIcon
                    className="cursor-pointer text-gray-500 hover:text-purple-600"
                    onClick={() => {
                      setDlgDevices(true);
                    }}
                  />
                </div>
              </div>
              <div
                className={`overflow-hidden relative rounded-lg aspect-video bg-gray-100 ${
                  !isCameraPermissionAllowed || !webcamOn
                    ? "hidden"
                    : "flex"
                } items-center justify-center shadow-inner mb-4`}
                style={{ height: "250px" }}
              >
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  ref={videoPlayerRef}
                />

                <div className="absolute right-2 bottom-2 flex items-center justify-center gap-1">
                  <NetworkStats />
                </div>
              </div>
              <div
                className={`overflow-hidden relative rounded-lg aspect-video bg-gray-100 ${
                  isCameraPermissionAllowed && webcamOn ? "hidden" : "flex"
                } items-center justify-center shadow-inner mb-4`}
                style={{ height: "250px" }}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="h-[40px] w-[40px] rounded-full bg-gray-300 flex justify-center items-center">
                    <VideocamOffIcon className="fill-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {isCameraPermissionAllowed
                      ? "Camera is turned off"
                      : "Camera permission is required"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-5">
                <div
                  onClick={() => {
                    const updateWebcam = !webcamOn;
                    setWebcamOn(updateWebcam);
                    if (!updateWebcam) {
                      if (videoTrack) {
                        if (videoTrack.kind === "video") {
                          videoTrack.stop();
                          setVideoTrack(null);
                          setCustomVideoStream(null);
                        }
                      }
                    } else {
                      if (
                        isCameraPermissionAllowed &&
                        !videoTrack &&
                        webcams.length
                      ) {
                        getVideoTrack({
                          webcams,
                          selectedWebcam,
                          setSelectedWebcam,
                          setCustomVideoStream,
                          setVideoTrack,
                        });
                      }
                    }
                  }}
                  className={`rounded-full min-w-[54px] h-[54px] ${
                    webcamOn && isCameraPermissionAllowed
                      ? "bg-purple-600"
                      : "bg-gray-200"
                  } cursor-pointer p-3 hover:opacity-90 transition shadow-md`}
                >
                  {webcamOn && isCameraPermissionAllowed ? (
                    <VideocamIcon
                      fill="#ffffff"
                      style={{ color: "#ffffff" }}
                    />
                  ) : (
                    <VideocamOffIcon
                      fill="#666666"
                      style={{ color: "#666666" }}
                    />
                  )}
                </div>

                <div
                  onClick={() => {
                    const updateMic = !micOn;
                    setMicOn(updateMic);
                    if (!updateMic) {
                      if (audioTrack) {
                        if (audioTrack.kind === "audio") {
                          audioTrack.stop();
                          setAudioTrack(null);
                          setCustomAudioStream(null);
                        }
                      }
                    } else {
                      if (
                        isMicrophonePermissionAllowed &&
                        !audioTrack &&
                        mics.length
                      ) {
                        getAudioTrack({
                          mics,
                          selectedMic,
                          setSelectedMic,
                          setCustomAudioStream,
                          setAudioTrack,
                        });
                      }
                    }
                  }}
                  className={`rounded-full min-w-[54px] h-[54px] ${
                    micOn && isMicrophonePermissionAllowed
                      ? "bg-purple-600"
                      : "bg-gray-200" 
                  } cursor-pointer p-3 hover:opacity-90 transition shadow-md`}
                >
                  {micOn && isMicrophonePermissionAllowed ? (
                    <MicIcon
                      fill="#ffffff"
                      style={{ color: "#ffffff" }}
                    />
                  ) : (
                    <MicOffIcon
                      fill="#666666"
                      style={{ color: "#666666" }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Join Meeting section */}
            <div className="md:w-2/3 bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col justify-center">
              <div className="mx-auto max-w-md w-full">
                <div className="p-4 rounded-lg mb-6 text-center bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome to <span className="text-purple-600">ie</span><span className="text-blue-600">VidMeet</span>
                  </h2>
                  <p className="text-gray-700 mb-3">
                    Experience seamless video conferencing with crystal-clear audio and HD video quality.
                    Connect with colleagues for professional code calls in a secure environment.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Featuring real-time screen sharing, chat functionality, and end-to-end encryption for your privacy.
                  </p>
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
                        theme: "light",
                      });
                    }
                  }}
                  _handleOnCreateMeeting={async () => {
                    const token = await getToken();
                    const { meetingId, err } = await createMeeting({ token });

                    if (meetingId) {
                      setToken(token);
                      setMeetingId(meetingId);
                    }
                    return { meetingId: meetingId, err: err };
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio
            input volume from system settings."
      />
      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
      {/* Customer Support Chat */}
      <div className="fixed bottom-0 left-0 right-0">
        {/*Start of Tawk.to Script*/}
        <script type="text/javascript">
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6616a163a0c6737bd12a56c8/1hr46cts6';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        </script>
        {/*End of Tawk.to Script*/}
      </div>
    </div>
  );
}