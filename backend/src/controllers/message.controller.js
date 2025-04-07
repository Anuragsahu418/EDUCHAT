import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Get users for the sidebar (excluding the authenticated user)
export const getUsersForSidebar = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const users = await User.find({ _id: { $ne: authUserId } }).select(
      "_id fullName profilePic"
    );
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between the authenticated user and the selected user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    })
      .populate("senderId", "_id fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (with or without an image)
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`; // Path to the uploaded image
      console.log("Image uploaded:", image);
    } else {
      console.log("No image uploaded");
    }

    const message = new Message({
      senderId,
      receiverId,
      text: text || "",
      image,
    });

    await message.save();

    // Populate senderId to include the full user object
    await message.populate("senderId", "_id fullName profilePic");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete selected messages
export const deleteMessages = async (req, res) => {
  try {
    const { messageIds, deleteFor } = req.body;
    const userId = req.user._id;

    const messages = await Message.find({ _id: { $in: messageIds } });

    for (const message of messages) {
      if (req.user.role === "admin" || message.senderId.toString() === userId.toString()) {
        if (deleteFor === "me") {
          if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
          }
        } else if (deleteFor === "everyone") {
          if (message.receiverId) {
            // 1:1 chat
            if (!message.deletedFor.includes(userId)) message.deletedFor.push(userId);
            if (!message.deletedFor.includes(message.receiverId)) message.deletedFor.push(message.receiverId);
          } else if (message.groupId) {
            // Group chat: delete for all members
            const group = await Group.findById(message.groupId);
            group.members.forEach((memberId) => {
              if (!message.deletedFor.includes(memberId)) message.deletedFor.push(memberId);
            });
          }
        }
        await message.save();

        // Notify all affected users
        if (deleteFor === "everyone") {
          const senderSocketId = getReceiverSocketId(message.senderId.toString());
          if (message.receiverId) {
            const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
            if (senderSocketId) io.to(senderSocketId).emit("messagesDeleted", [message._id]);
            if (receiverSocketId) io.to(receiverSocketId).emit("messagesDeleted", [message._id]);
          } else if (message.groupId) {
            const group = await Group.findById(message.groupId);
            group.members.forEach((memberId) => {
              const socketId = getReceiverSocketId(memberId.toString());
              if (socketId) io.to(socketId).emit("messagesDeleted", [message._id]);
            });
          }
        } else if (deleteFor === "me") {
          const senderSocketId = getReceiverSocketId(userId.toString());
          if (senderSocketId) io.to(senderSocketId).emit("messagesDeleted", [message._id]);
        }
      } else {
        return res.status(403).json({ message: "Unauthorized to delete this message" });
      }
    }
    
    res.json({ message: "Messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting messages", error: error.message });
  }
};

  
// Clear chat between the authenticated user and the selected user
export const clearChat = async (req, res) => {
  try {
    const { id: chatPartnerId } = req.params;
    const authUserId = req.user._id;

    // Delete messages between the two users
    await Message.deleteMany({
      $or: [
        { senderId: authUserId, receiverId: chatPartnerId },
        { senderId: chatPartnerId, receiverId: authUserId },
      ],
    });

    // Emit event to notify the chat partner
    const receiverSocketId = getReceiverSocketId(chatPartnerId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatCleared", {
        userId: authUserId,
        chatPartnerId,
      });
    }

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.log("Error in clearChat controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};