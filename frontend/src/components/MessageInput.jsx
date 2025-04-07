import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [images, setImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedMessages, toggleMessageSelection } = useChatStore();

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newImages = selectedFiles.filter((file) => file.type.startsWith("image/"));

    if (newImages.length !== selectedFiles.length) {
      toast.error("Only image files are allowed");
      return;
    }

    if (newImages.length > 1) {
      toast.error("Please select only one image at a time");
      return;
    }

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));

    setImages(newImages); // Overwrite previous images
    setImagePreviews(newPreviews); // Overwrite previous previews
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) {
      toast.error("Enter a message or select an image");
      return;
    }

    try {
      const messageData = { text };
      if (images.length > 0) {
        messageData.image = images[0]; // Send only the first image
      }
      await sendMessage(messageData);

      setText("");
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (selectedMessages.length > 0) {
        selectedMessages.forEach((msg) => toggleMessageSelection(msg));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Try again.");
    }
  };

  return (
    <div className="p-4 w-full bg-base-100 border-t border-base-300">
      {imagePreviews.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-base-300"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden" // Removed 'multiple' to limit to one image
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreviews.length > 0 ? "text-emerald-500" : "text-base-content"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <button
            type="button"
            className="btn btn-circle"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary"
          disabled={!text.trim() && images.length === 0}
        >
          <Send size={22} />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-10 emoji-picker">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              lazyLoadEmojis={true}
              previewConfig={{ showPreview: false }}
              className="emoji-picker-theme"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;