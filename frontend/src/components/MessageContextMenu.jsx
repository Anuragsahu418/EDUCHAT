// frontend/src/components/MessageContextMenu.jsx
import { useChatStore } from "../store/useChatStore";
import { Trash2, Forward } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const MessageContextMenu = () => {
  const { contextMenu, hideContextMenu, deleteMessage, setForwardingMessages, selectedMessages } = useChatStore();
  const { authUser } = useAuthStore();

  if (!contextMenu.visible) return null;

  const isSender = selectedMessages.every((msg) => msg.senderId._id === authUser._id);

  const handleDeleteForMe = () => {
    deleteMessage("me");
    hideContextMenu();
  };

  const handleDeleteForEveryone = () => {
    deleteMessage("everyone");
    hideContextMenu();
  };

  const handleForward = () => {
    setForwardingMessages(selectedMessages);
    hideContextMenu();
  };

  return (
    <div
      className="absolute z-50 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="menu">
        <button
          onClick={handleDeleteForMe}
          className="flex items-center gap-2 p-2 text-base-content hover:bg-base-300 rounded w-full text-left"
        >
          <Trash2 size={16} /> Delete for Me
        </button>
        {(isSender || authUser.role === "admin") && (
          <button
            onClick={handleDeleteForEveryone}
            className="flex items-center gap-2 p-2 text-base-content hover:bg-base-300 rounded w-full text-left"
          >
            <Trash2 size={16} /> Delete for Everyone
          </button>
        )}
        <button
          onClick={handleForward}
          className="flex items-center gap-2 p-2 text-base-content hover:bg-base-300 rounded w-full text-left"
        >
          <Forward size={16} /> Forward
        </button>
      </div>
    </div>
  );
};

export default MessageContextMenu;