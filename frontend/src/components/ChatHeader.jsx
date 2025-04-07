import { X, Trash2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat, selectedGroup, setSelectedGroup } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      clearChat();
    }
  };

  const entity = selectedUser || selectedGroup;
  const isUser = !!selectedUser;

  if (!entity) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={isUser ? (entity.profilePic || "/avatar.png") : "/group-avatar.png"} alt={entity.fullName || entity.name} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{isUser ? entity.fullName : entity.name}</h3>
            <p className="text-sm text-base-content/70">
              {isUser ? (onlineUsers.includes(entity._id) ? "Online" : "Offline") : "Group Chat"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(authUser.role === "admin" || authUser.role === "student" || authUser.role === "teacher" || (selectedUser && authUser._id === selectedUser._id) || (selectedGroup && selectedGroup.members.includes(authUser._id))) && (
            <button onClick={handleClearChat} className="btn btn-sm btn-error">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
          <button onClick={() => (isUser ? setSelectedUser(null) : setSelectedGroup(null))} className="btn btn-sm">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;