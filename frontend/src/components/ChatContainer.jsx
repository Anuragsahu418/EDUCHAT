import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    toggleMessageSelection,
    showContextMenu,
    selectedMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    } else if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDoubleClick = (message, event) => {
    event.stopPropagation();
    toggleMessageSelection(message);
  };

  const handleRightClick = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedMessages.some((msg) => msg._id === message._id)) {
      toggleMessageSelection(message);
    }
    showContextMenu(e.clientX, e.clientY, message);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser && !selectedGroup) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-00">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId._id === authUser._id ? "chat-end" : "chat-start"} ${
              selectedMessages.some((msg) => msg._id === message._id) ? "selected-message" : ""
            }`}
            onDoubleClick={(e) => handleDoubleClick(message, e)}
            onContextMenu={(e) => handleRightClick(e, message)}
          >
            <div className="chat-image avatar" onDoubleClick={(e) => e.stopPropagation()}>
              <div className="size-10 rounded-full border">
                <img src={message.senderId.profilePic || "/avatar.png"} alt="profile pic" />
              </div>
            </div>
            <div className="chat-header mb-1" onDoubleClick={(e) => e.stopPropagation()}>
              <span>{message.senderId.fullName}</span>
              <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
            </div>
            <div
              className={`chat-bubble flex flex-col ${
                message.senderId._id === authUser._id
                  ? "bg-primary text-primary-content"
                  : "bg-base-300 text-base-content"
              }`}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              {message.image && (
                <a href={`http://localhost:5001${message.image}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src={
                      message.image.endsWith(".pdf") ||
                      message.image.endsWith(".docx")
                        ? "/file-icon.png" // Use a placeholder icon for non-image files
                        : `http://localhost:5001${message.image}`
                    }
                    alt="Message attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                </a>
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;