export function LeaveScreen({ setIsMeetingLeft }) {
  return (
    <div 
      className="h-screen flex flex-col flex-1 items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1a1c22 0%, #26282c 100%)"
      }}
    >
      <div className="flex flex-col items-center p-8 bg-gray-750 bg-opacity-50 backdrop-filter backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl max-w-md w-full">
        <div className="w-24 h-24 mb-6 rounded-full bg-purple-350 bg-opacity-20 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="#5568FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ 
            backgroundImage: "linear-gradient(90deg, #5568FE, #76d9e6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          You left the meeting!
        </h1>
        
        <p className="text-gray-400 text-center mb-8">
          Your meeting session has ended. We hope you had a productive conversation.
        </p>
        
        <button
          className="w-full bg-purple-350 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 hover:shadow-lg"
          style={{
            background: "linear-gradient(90deg, #5568FE, #6246FB)",
            boxShadow: "0 4px 14px rgba(85, 104, 254, 0.4)"
          }}
          onClick={() => {
            setIsMeetingLeft(false);
          }}
        >
          Rejoin the Meeting
        </button>
        
        <div className="mt-6 text-gray-400 text-sm">
          Need help? <a href="#" className="text-blue-350 hover:underline">Contact support</a>
        </div>
      </div>
    </div>
  );
}
