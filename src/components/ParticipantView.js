import React, { useMemo } from "react";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import WebcamOffSmallIcon from "../icons/WebcamOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";

export function ParticipantView({ participantId }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, isActiveSpeaker, isScreen, screenShareStream } = useParticipant(participantId);
  const { localParticipantId, creator } = useMeeting();
  const { creatorId } = useMeetingAppContext();

  const isCreator = localParticipantId === creatorId;
  const canControlOthers = isCreator && !isLocal;

  const webcamRef = useMemo(() => {
    return React.createRef();
  }, []);

  const screenShareRef = useMemo(() => {
    return React.createRef();
  }, []);

  // Set video stream to webcam element
  useMemo(() => {
    if (webcamRef.current) {
      if (webcamOn && webcamStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        webcamRef.current.srcObject = mediaStream;
        webcamRef.current
          .play()
          .catch((error) => console.error("Error playing webcam:", error));
      } else {
        webcamRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  // Set screen share stream
  useMemo(() => {
    if (screenShareRef.current) {
      if (isScreen && screenShareStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(screenShareStream.track);
        screenShareRef.current.srcObject = mediaStream;
        screenShareRef.current
          .play()
          .catch((error) => console.error("Error playing screen share:", error));
      } else {
        screenShareRef.current.srcObject = null;
      }
    }
  }, [isScreen, screenShareStream]);

  // Admin controls
  const { disableWebcam, disableMic, remove } = useMeeting();

  const handleDisableWebcam = () => {
    if (canControlOthers) {
      disableWebcam(participantId);
    }
  };

  const handleDisableMic = () => {
    if (canControlOthers) {
      disableMic(participantId);
    }
  };

  const handleRemoveParticipant = () => {
    if (canControlOthers) {
      remove(participantId);
    }
  };

  return (
    <div className={`h-full w-full relative ${isActiveSpeaker ? "border-2 border-primary" : ""}`}>
      <div className="absolute top-2 left-2 z-10">
        <p className="text-sm text-white bg-gray-700 p-1 rounded">
          {displayName || ""}
          {isLocal ? " (You)" : ""}
        </p>
      </div>

      {isScreen ? (
        <div className="h-full w-full relative flex items-center justify-center">
          <video
            autoPlay
            playsInline
            muted
            ref={screenShareRef}
            controls={false}
            className="h-full w-full object-contain"
          />
          <div className="absolute top-2 right-2 z-10">
            <ScreenShareIcon fillColor="#ffffff" />
          </div>
        </div>
      ) : webcamOn ? (
        <video
          autoPlay
          playsInline
          muted={isLocal}
          ref={webcamRef}
          className="h-full w-full object-cover rounded"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
              <p className="text-2xl text-white">{displayName?.charAt(0)?.toUpperCase() || "U"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex gap-1 z-10">
        {!micOn && <MicOffSmallIcon fillColor="#ffffff" />}
        {!webcamOn && <WebcamOffSmallIcon fillColor="#ffffff" />}
      </div>

      {/* Admin controls */}
      {canControlOthers && (
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
          <button 
            onClick={handleDisableMic}
            className="bg-red-600 text-white text-xs p-1 rounded"
            title="Mute participant"
          >
            Mute
          </button>
          <button 
            onClick={handleDisableWebcam}
            className="bg-red-600 text-white text-xs p-1 rounded"
            title="Turn off camera"
          >
            Disable Cam
          </button>
          <button 
            onClick={handleRemoveParticipant}
            className="bg-red-600 text-white text-xs p-1 rounded"
            title="Remove from meeting"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}