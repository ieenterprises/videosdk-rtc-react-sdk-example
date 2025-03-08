import { PaperAirplaneIcon } from "@heroicons/react/solid";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localSent = localParticipantId === senderId;

  // Check if the message contains a file attachment
  let messageText = text;
  let fileAttachment = null;

  try {
    // Try to parse the message as JSON (for messages with attachments)
    const parsedMessage = JSON.parse(text);
    if (parsedMessage.fileAttachment) {
      messageText = parsedMessage.text || '';
      fileAttachment = parsedMessage.fileAttachment;
    }
  } catch (e) {
    // Not a JSON message, treat as plain text
    messageText = text;
  }

  const handleFileDownload = (fileData) => {
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex ${
        localSent ? "justify-end" : "justify-start"
      } mt-4 flex-col ${
        localSent ? "items-end" : "items-start"
      } text-sm overflow-hidden`}
    >
      <div>
        <div
          className={`${
            localSent ? "bg-indigo-600" : "bg-zinc-700"
          } ${localSent ? "text-white" : "text-white"} ${
            localSent ? "rounded-tr-none" : "rounded-tl-none"
          } w-fit max-w-[256px] px-3 py-2 rounded-xl inline-block break-words`}
        >
          {messageText && <p className="mb-2">{messageText}</p>}

          {fileAttachment && (
            <div 
              className="flex items-center gap-2 p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => handleFileDownload(fileAttachment)}
            >
              <span className="material-icons text-sm">attachment</span>
              <div className="overflow-hidden">
                <p className="text-xs font-medium truncate">{fileAttachment.name}</p>
                <p className="text-xs text-gray-300">
                  {Math.round(fileAttachment.size / 1024)} KB
                </p>
              </div>
              <span className="material-icons text-sm ml-auto">download</span>
            </div>
          )}
        </div>
      </div>
      <div className={`flex ${localSent ? "justify-start" : "justify-end"}`}>
        <p className="text-xs text-gray-300 px-2 pt-1 w-fit max-w-[256px]">
          {`${localSent ? "You" : senderName} • ${new Date(
            timestamp
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
        </p>
      </div>
    </div>
  );
};

const ChatInput = ({ inputHeight }) => {
  const { publish } = usePubSub("CHAT");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = () => {
    if (message.length > 0 || file) {
      if (file) {
        // Convert file to base64 for sending
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result
          };

          // Send message with file attachment
          publish(JSON.stringify({
            text: message,
            fileAttachment: fileData
          }), { persist: true });

          setMessage("");
          setFile(null);
        };
        reader.readAsDataURL(file);
      } else {
        // Send text-only message
        publish(message, { persist: true });
        setMessage("");
      }
    }
  };

  return (
    <div
      style={{ height: inputHeight }}
      className="w-full bg-gray-750 px-4 py-4"
    >
      {file && (
        <div className="mb-2 p-2 bg-gray-700 rounded-md flex items-center justify-between">
          <span className="text-white text-sm truncate">{file.name}</span>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => setFile(null)}
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}
      <div className="flex">
        <input
          autoComplete="off"
          id="chatTextArea"
          className="flex-grow bg-gray-750 border-2 border-gray-400 p-2 rounded-md text-white" // Added border
          placeholder="Write your message"
          value={message}
          onChange={(e) => {
            const v = e.target.value;
            setMessage(v);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSendMessage();
            }
          }}
        />
        <button
          className="mx-2 p-2 text-white bg-gray-750 rounded-md"
          onClick={() => fileInputRef.current.click()}
          title="Attach file"
        >
          <span className="material-icons">attach_file</span>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange}
          />
        </button>n>
        <button
          className="p-2 text-white bg-gray-750 rounded-md"
          onClick={handleSendMessage}
        >
          <span className="material-icons">send</span> {/* Replaced text with icon */}
        </button>
      </div>
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const { messages } = usePubSub("CHAT");

  const scrollToBottom = (data) => {
    if (!data) {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    } else {
      const { text } = data;

      if (json_verify(text)) {
        const { type } = JSON.parse(text);
        if (type === "CHAT") {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return messages ? (
    <div ref={listRef} style={{ overflowY: "scroll", height: listHeight }}>
      <div className="p-4">
        {messages.map((msg, i) => {
          const { senderId, senderName, message, timestamp } = msg;
          return (
            <ChatMessage
              key={`chat_item_${i}`}
              {...{ senderId, senderName, text: message, timestamp }}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <p>No messages</p>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 72;
  const listHeight = panelHeight - inputHeight;

  return (
    <div>
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}