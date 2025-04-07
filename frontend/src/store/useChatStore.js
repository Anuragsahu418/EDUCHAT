import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  selectedMessages: [],
  contextMenu: { visible: false, x: 0, y: 0, message: null },
  forwardingMessages: [],
  selectedChats: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const formData = new FormData();
      if (messageData.text) formData.append("text", messageData.text);
      if (messageData.image) {
        formData.append("image", messageData.image);
        console.log("Sending image:", messageData.image);
      } else {
        console.log("No image to send");
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Send message response:", res.data);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send image");
    }
  },

  deleteMessage: async () => {
    const { selectedMessages } = get();
    if (selectedMessages.length === 0) return;

    const messageIds = selectedMessages.map((msg) => msg._id);
    try {
      const res = await axiosInstance.delete("/messages", {
        data: { ids: messageIds },
      });
      if (res.status === 200) {
        set((state) => ({
          messages: state.messages.filter((msg) => !messageIds.includes(msg._id)),
          selectedMessages: [],
          contextMenu: { visible: false, x: 0, y: 0, message: null },
        }));
        toast.success("Messages deleted successfully");
      }
    } catch (error) {
      console.error("Error in deleteMessage:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to delete messages");
    }
  },

  clearChat: async () => {
    const { selectedUser } = get();
    try {
      await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
      set({
        messages: [],
        selectedMessages: [],
        contextMenu: { visible: false, x: 0, y: 0, message: null },
      });
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  forwardMessage: async (receiverId) => {
    const { forwardingMessages } = get();
    try {
      for (const message of forwardingMessages) {
        const formData = new FormData();
        formData.append("text", message.text || "");
        if (message.image) formData.append("image", message.image);

        const res = await axiosInstance.post(
          `/messages/send/${receiverId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Forwarded message response:", res.data);

        // Only add the message to the current chat if the receiver is the selected user
        if (receiverId === get().selectedUser?._id) {
          set((state) => ({
            messages: [...state.messages, res.data],
          }));
        }
      }
      set({ forwardingMessages: [], selectedMessages: [] });
      toast.success("Messages forwarded successfully");
    } catch (error) {
      console.error("Error forwarding message:", error);
      toast.error(error.response?.data?.message || "Failed to forward messages");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // Only add the message if it's meant for the current chat
      const isMessageForCurrentChat =
        (newMessage.senderId._id === selectedUser._id && newMessage.receiverId === authUser._id) ||
        (newMessage.senderId._id === authUser._id && newMessage.receiverId === selectedUser._id);

      if (!isMessageForCurrentChat) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });

    socket.on("messagesDeleted", (messageIds) => {
      set((state) => ({
        messages: state.messages.filter((msg) => !messageIds.includes(msg._id)),
        selectedMessages: state.selectedMessages.filter(
          (msg) => !messageIds.includes(msg._id)
        ),
        contextMenu: { visible: false, x: 0, y: 0, message: null },
      }));
    });

    socket.on("chatCleared", ({ userId, chatPartnerId }) => {
      const { selectedUser, authUser } = get();
      if (
        (userId === selectedUser._id && chatPartnerId === authUser._id) ||
        (userId === authUser._id && chatPartnerId === selectedUser._id)
      ) {
        set({
          messages: [],
          selectedMessages: [],
          contextMenu: { visible: false, x: 0, y: 0, message: null },
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesDeleted");
    socket.off("chatCleared");
  },

  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      selectedMessages: [],
      contextMenu: { visible: false, x: 0, y: 0, message: null },
    }),

  toggleMessageSelection: (message) => {
    set((state) => {
      const isSelected = state.selectedMessages.some(
        (msg) => msg._id === message._id
      );
      if (isSelected) {
        return {
          selectedMessages: state.selectedMessages.filter(
            (msg) => msg._id !== message._id
          ),
        };
      } else {
        return {
          selectedMessages: [...state.selectedMessages, message],
        };
      }
    });
  },

  clearSelectedMessages: () => set({ selectedMessages: [] }),

  showContextMenu: (x, y, message) =>
    set({ contextMenu: { visible: true, x, y, message } }),

  hideContextMenu: () =>
    set({ contextMenu: { visible: false, x: 0, y: 0, message: null } }),

  setForwardingMessages: (messages) => set({ forwardingMessages: messages }),

  toggleChatSelection: (chat) => {
    set((state) => {
      const isSelected = state.selectedChats.some((c) => c._id === chat._id);
      if (isSelected) {
        return {
          selectedChats: state.selectedChats.filter((c) => c._id !== chat._id),
        };
      } else {
        return {
          selectedChats: [...state.selectedChats, chat],
        };
      }
    });
  },

  clearSelectedChats: () => set({ selectedChats: [] }),

  deleteSelectedChats: async () => {
    const { selectedChats } = get();
    if (selectedChats.length === 0) return;

    try {
      for (const chat of selectedChats) {
        await axiosInstance.delete(`/messages/clear/${chat._id}`);
      }
      set((state) => ({
        users: state.users.filter(
          (user) => !selectedChats.some((chat) => chat._id === user._id)
        ),
        selectedChats: [],
        selectedUser: null,
        messages: [],
      }));
      toast.success("Selected chats deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chats");
    }
  },
}));