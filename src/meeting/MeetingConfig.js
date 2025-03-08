import React from 'react';
import { useMeetingAppContext } from './MeetingAppContext'; // Assuming this context exists

export default function MeetingConfig({
  meetingId,
  token,
  participantName,
  micEnabled,
  webcamEnabled,
  setMeetingStarted,
  setIsMeetingLeft,
  onMeetingLeave,
  meeting, // Added meeting prop to access localParticipant
}) {
  const { setCreatorId } = useMeetingAppContext();

  return (
    <div>
      {/*  Rest of the MeetingConfig component would go here.  This is placeholder only. */}
      <p>Meeting ID: {meetingId}</p>
      <p>Your Name: {participantName}</p>
      <p>Mic Enabled: {micEnabled ? 'Yes' : 'No'}</p>
      <p>Webcam Enabled: {webcamEnabled ? 'Yes' : 'No'}</p>

      {/* Example of using setCreatorId.  This needs to be integrated appropriately into the application logic. */}
      <button onClick={() => setCreatorId(meeting?.localParticipant?.id)}>Set as Creator</button> {/* Assumes meeting object has localParticipant.id */}

    </div>
  );
}