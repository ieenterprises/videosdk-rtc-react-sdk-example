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

// Custom component to load Tawk.to chat widget
const TawkToChat = () => {
  useEffect(() => {
    // Create container div
    const containerDiv = document.createElement('div');
    containerDiv.id = 'tawk_6616a163a0c6737bd12a56c8';
    document.body.appendChild(containerDiv);

    // Create and insert Tawk.to script
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    Tawk_API.embedded = 'tawk_6616a163a0c6737bd12a56c8';

    const script = document.createElement("script");
    script.id = 'tawk-to-script';
    script.async = true;
    script.src = 'https://embed.tawk.to/6616a163a0c6737bd12a56c8/1ilrgsu2o';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);

    // Clean up function to remove the script and container when component unmounts
    return () => {
      // Remove the script
      if(script && script.parentNode) {
        script.parentNode.removeChild(script);
      }

      // Remove the container
      if(containerDiv && containerDiv.parentNode) {
        containerDiv.parentNode.removeChild(containerDiv);
      }

      // Remove any other Tawk elements that might be present
      const tawkContainer = document.getElementById('tawk_6616a163a0c6737bd12a56c8');
      if (tawkContainer) {
        tawkContainer.remove();
      }

      // Remove Tawk iframe and widget elements
      const tawkIframes = document.querySelectorAll('iframe[src*="tawk.to"]');
      tawkIframes.forEach(iframe => iframe.remove());

      const tawkWidgets = document.querySelectorAll('.tawk-min-container, .tawk-card');
      tawkWidgets.forEach(widget => widget.remove());
    };
  }, []);

  return null;
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
  const [meetingTitle, setMeetingTitle] = useState(""); // Added meetingTitle state

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

  // Add custom styling for the Tawk.to chat widget
  useEffect(() => {
    // Add custom styling for positioning the chat widget at bottom left
    const style = document.createElement('style');
    style.textContent = `
      .tawk-min-container {
        margin: 0 !important;
        left: 20px !important;
        right: auto !important;
        bottom: 20px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0">
      {/* Render the Tawk.to chat component */}
      <TawkToChat />
      <div className="overflow-y-auto flex flex-col flex-1 h-screen bg-white">
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:m-[72px] m-16 relative">
          <div className="absolute inset-0 bg-indigo-800 opacity-5 z-0 pointer-events-none"></div>
          <div className="container grid md:grid-flow-col grid-flow-row relative z-10">
            <div className="grid grid-cols-12">
              <div className="md:col-span-7 2xl:col-span-7 col-span-12">
                <div className="flex items-center justify-center p-1.5 sm:p-4 lg:p-6">
                  <div className="relative w-full md:pl-4 sm:pl-10 pl-5  md:pr-4 sm:pr-10 pr-5">
                    <div className="w-full relative" style={{ height: "55vh" }}>
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={videoPlayerRef}
                        controls={false}
                        style={{
                          backgroundColor: "#1c1c1c",
                        }}
                        className={
                          "rounded-[10px] h-full w-full object-cover flex items-center justify-center flip"
                        }
                      />
                      {!isMobile ? (
                        <>
                          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
                            {!webcamOn ? (
                              <p className="text-xl xl:text-lg 2xl:text-xl text-white">
                                The camera is off
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : null}

                      <div className="absolute xl:bottom-6 bottom-4 left-0 right-0">
                        <div className="container grid grid-flow-col space-x-4 items-center justify-center md:-m-2">
                          {isMicrophonePermissionAllowed ? (
                            <ButtonWithTooltip
                              onClick={_toggleMic}
                              onState={micOn}
                              mic={true}
                              OnIcon={MicOnIcon}
                              OffIcon={MicOffIcon}
                            />
                          ) : (
                            <MicPermissionDenied />
                          )}

                          {isCameraPermissionAllowed ? (
                            <ButtonWithTooltip
                              onClick={_toggleWebcam}
                              onState={webcamOn}
                              mic={false}
                              OnIcon={WebcamOnIcon}
                              OffIcon={WebcamOffIcon}
                            />
                          ) : (
                            <CameraPermissionDenied />
                          )}
                        </div>
                      </div>
                    </div>

                    {!isMobile && (
                      <>
                        <div className="absolute top-2 right-10">
                          <NetworkStats />
                        </div>

                        <div className="flex mt-3">
                          {!isFirefox && (
                            <>
                              <DropDown
                                mics={mics}
                                changeMic={changeMic}
                                customAudioStream={customAudioStream}
                                audioTrack={audioTrack}
                                micOn={micOn}
                                didDeviceChange={didDeviceChange}
                                setDidDeviceChange={setDidDeviceChange}
                              />
                              <DropDownSpeaker speakers={speakers} />
                              <DropDownCam
                                changeWebcam={changeWebcam}
                                webcams={webcams}
                              />
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 2xl:col-span-5 col-span-12 md:relative">
                <div className="flex flex-1 flex-col items-center justify-center xl:m-16 lg:m-6 md:mt-9 lg:mt-14 xl:mt-20 mt-3 md:absolute md:left-0 md:right-0 md:top-0 md:bottom-0">
                  <div className="bg-indigo-800 p-8 rounded-md shadow-lg mb-6 text-center max-w-lg w-full">
                    <div className="flex flex-col items-center mb-4">
                      <img src="/company-logo.ico" alt="Company Logo" className="w-16 h-16 mb-3" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome to ieVidMeet</h2>
                    <p className="text-white text-sm mb-6">
                      Seamless HD video calls, crystal-clear audio, secure meetings, and real-time collaboration.
                    </p>

                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md mb-1 flex justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Save Meeting code as it is Temporary
                    </button>
                    <p className="text-white text-xs text-center mb-3"></p>

                    <button className="w-full border border-gray-300 hover:bg-indigo-700 text-white py-3 rounded-md mb-1">
                      <div className="flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Save Meeting Link as it is Temporary
                      </div>
                    </button>
                    <p className="text-white text-xs text-center mb-6"></p>

                    <div className="bg-indigo-700 bg-opacity-50 rounded-md p-4 text-left">
                      <h3 className="text-white text-sm font-medium mb-2">Quick Start Guide</h3>
                      <div className="flex items-center text-white text-xs mb-2">
                        <svg className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Test your audio and video
                      </div>
                      <div className="flex items-center text-white text-xs mb-2">
                        <svg className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Share meeting link with participants
                      </div>
                      <div className="flex items-center text-white text-xs">
                        <svg className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ensure stable internet connection
                      </div>
                    </div>
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
                      const { meetingId, err } = await createMeeting({ token, meetingTitle }); // Pass meetingTitle to createMeeting

                      if (meetingId) {
                        setToken(token);
                        setMeetingId(meetingId);
                        localStorage.setItem(`meeting_${meetingId}_title`, meetingTitle); //Store meeting title in local storage
                      }
                      return { meetingId: meetingId, err: err };
                    }}
                  />
                </div>
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
    </div>
  );
}