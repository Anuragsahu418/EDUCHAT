import toast from "react-hot-toast";
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Text copied to clipboard");
  }).catch((err) => {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy text");
  });
}