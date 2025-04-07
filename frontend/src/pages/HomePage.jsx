import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import MessageContextMenu from "../components/MessageContextMenu";

const HomePage = () => {
  const { selectedUser, users, forwardingMessages, forwardMessage, setForwardingMessages } = useChatStore();
  const [showForwardModal, setShowForwardModal] = useState(false);

  useEffect(() => {
    if (forwardingMessages.length > 0) {
      setShowForwardModal(true);
    }
  }, [forwardingMessages]);

  const handleForward = (receiverId) => {
    forwardMessage(receiverId);
    setShowForwardModal(false);
    setForwardingMessages([]);
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            <MessageContextMenu />
          </div>
        </div>
      </div>
      {showForwardModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Forward Messages</h3>
            <p className="py-4">Select a user to forward {forwardingMessages.length} message(s) to:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleForward(user._id)}
                  className="w-full p-2 flex items-center gap-2 hover:bg-base-200 rounded"
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.fullName}</span>
                </button>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowForwardModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;