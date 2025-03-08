import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";

const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

function ParticipantGrid({ participantIds, isPresenting }) {
  const { sideBarMode } = useMeetingAppContext();
  const isMobile = window.matchMedia(
    "only screen and (max-width: 768px)"
  ).matches;

  const perRow =
    isMobile || isPresenting
      ? participantIds.length < 4
        ? 1
        : participantIds.length < 9
        ? 2
        : 3
      : participantIds.length < 5
      ? 2
      : participantIds.length < 7
      ? 3
      : participantIds.length < 9
      ? 4
      : participantIds.length < 10
      ? 3
      : participantIds.length < 11
      ? 4
      : 4;

  return (
    <div
      className={`flex flex-col md:flex-row flex-grow m-3 items-center justify-center ${
        participantIds.length < 2 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-2"
          : participantIds.length < 3 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-8"
          : participantIds.length < 4 && !sideBarMode && !isPresenting
          ? "md:px-16 md:py-4"
          : participantIds.length > 4 && !sideBarMode && !isPresenting
          ? "md:px-14"
          : "md:px-0"
      }`}
    >
      <div className="flex flex-col w-full h-full">
        {Array.from(
          { length: Math.ceil(participantIds.length / perRow) },
          (_, i) => {
            return (
              <div
                key={`participant-${i}`}
                className={`flex flex-1 ${
                  isPresenting
                    ? participantIds.length === 1
                      ? "justify-start items-start"
                      : "items-center justify-center"
                    : "items-center justify-center"
                }`}
              >
                {participantIds
                  .slice(i * perRow, (i + 1) * perRow)
                  .map((participantId) => {
                    return (
                      <div
                        key={`participant_${participantId}`}
                        className={`flex flex-1 ${
                          isPresenting
                            ? participantIds.length === 1
                              ? "md:h-48 md:w-44 xl:w-52 xl:h-48 "
                              : participantIds.length === 2
                              ? "md:w-44 xl:w-56"
                              : "md:w-44 xl:w-48"
                            : "w-full"
                        } items-center justify-center h-full ${
                          participantIds.length === 1
                            ? "md:max-w-7xl 2xl:max-w-[1480px] "
                            : "md:max-w-lg 2xl:max-w-2xl"
                        } overflow-clip overflow-hidden  p-1`}
                      >
                        <MemoizedParticipant participantId={participantId} />
                      </div>
                    );
                  })}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
        JSON.stringify(nextProps.participantIds) &&
      prevProps.isPresenting === nextProps.isPresenting
    );
  }
);
import React, { useCallback, useMemo, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import useIsTrackEnabled from "../hooks/useIsTrackEnabled";
import useIsMobile from "../hooks/useIsMobile";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import NetworkIcon from "../icons/NetworkIcon";
import { CornerDisplayName } from "./CornerDisplayName";
import { ParticipantControls } from "./ParticipantControls";

function ParticipantView({ participantId }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);

  const micRef = useRef(null);
  const webcamRef = useRef(null);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (videoStream && webcamRef.current) {
      webcamRef.current.srcObject = videoStream;
      webcamRef.current
        .play()
        .catch((error) =>
          console.error("videoElem.current.play() failed", error)
        );
    }
  }, [videoStream]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div
      className={`h-full w-full relative overflow-hidden rounded-lg video-cover`}
    >
      <div className="absolute top-2 left-2 z-40">
        <NetworkIcon />
      </div>

      <audio ref={micRef} autoPlay muted={isLocal} />

      {webcamOn ? (
        <video
          className="h-full w-full object-cover rounded-lg"
          ref={webcamRef}
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-750 rounded-lg">
          <div
            className={`flex items-center justify-center rounded-full bg-gray-700 text-2xl relative`}
            style={{ height: "48px", width: "48px" }}
          >
            {displayName?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <CornerDisplayName
        displayName={displayName}
        micOn={micOn}
        webcamOn={webcamOn}
        isLocal={isLocal}
        participantId={participantId}
      />

      {!micOn && (
        <div className="absolute bottom-2 right-2 rounded-full flex items-center justify-center">
          <MicOffSmallIcon fillColor="white" />
        </div>
      )}

      {/* Add participant controls */}
      <ParticipantControls participantId={participantId} />
    </div>
  );
}

// Memoized Participant View
const MemoizedParticipantView = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return prevProps.participantId === nextProps.participantId;
  }
);

function ParticipantGrid({ participantIds }) {
  const isMobile = useIsMobile();

  let gridStyles = {};
  const participantCount = participantIds?.length || 0;

  if (participantCount === 1) {
    gridStyles = {
      gridTemplateRows: "1fr",
      gridTemplateColumns: "1fr",
    };
  } else if (participantCount === 2) {
    gridStyles = {
      gridTemplateRows: "1fr",
      gridTemplateColumns: "1fr 1fr",
    };
  } else if (participantCount === 3) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr",
      gridTemplateColumns: "1fr 1fr",
    };
  } else if (participantCount === 4) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr",
      gridTemplateColumns: "1fr 1fr",
    };
  } else if (participantCount === 5 || participantCount === 6) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr",
      gridTemplateColumns: "1fr 1fr 1fr",
    };
  } else if (participantCount === 7 || participantCount === 8) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
    };
  } else if (participantCount === 9 || participantCount === 10) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr 1fr",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
    };
  } else if (participantCount >= 11) {
    gridStyles = {
      gridTemplateRows: "1fr 1fr 1fr",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
    };
  }

  return (
    <div
      className="grid gap-4 flex-1 h-full"
      style={{
        ...gridStyles,
      }}
    >
      {participantIds?.map((participantId) => (
        <MemoizedParticipantView
          key={participantId}
          participantId={participantId}
        />
      ))}
    </div>
  );
}

// Memoized ParticipantGrid
const MemoizedParticipantGrid = React.memo(
  ParticipantGrid,
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.participantIds) ===
      JSON.stringify(nextProps.participantIds)
    );
  }
);

export { MemoizedParticipantGrid, ParticipantView };
