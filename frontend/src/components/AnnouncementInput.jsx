import { useState, } from "react";

const AnnouncementInput = ({ onSend }) => {
  const [text, setText] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("text", text);

    await onSend(formData);

    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Announce something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </div>
    </form>
  );
};

export default AnnouncementInput;