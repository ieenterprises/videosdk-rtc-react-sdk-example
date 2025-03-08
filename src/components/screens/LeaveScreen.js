export function LeaveScreen({ setIsMeetingLeft }) {
  return (
    <div className="bg-white h-screen flex flex-col flex-1 items-center justify-center">
      <Header />
      <h1 className="text-gray-800 text-4xl font-bold">You left the meeting!</h1>
      <div className="mt-12">
        <button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-16 py-4 rounded-lg text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          onClick={() => {
            setIsMeetingLeft(false);
          }}
        >
          Rejoin the Meeting
        </button>
      </div>
    </div>
  );
}
