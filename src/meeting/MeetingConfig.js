
// Meeting configurations
export const MEETING_CONFIG = {
  // Enable participant permissions control
  permissions: {
    // Allow only meeting creator to toggle other's webcam
    toggleWebcam: true,
    // Allow only meeting creator to toggle other's mic
    toggleMic: true,
    // Allow only meeting creator to remove participant
    removeParticipant: true,
    // Enable waiting room
    waitingRoom: true,
    // Allow only meeting creator to end meeting
    endMeeting: true,
    // Disable screen sharing for participants
    screenShare: "ONLY_MEETING_CREATOR",
  }
};
