import React, { useState } from "react";
import { MdSupportAgent } from "react-icons/md";
import { FaPaperPlane, FaHistory } from "react-icons/fa";

const TenantSupport = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = {
      ...formData,
      date: new Date().toLocaleDateString(),
    };
    setHistory((prev) => [newMessage, ...prev]);
    setSubmitted(true);
    setFormData({ subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto rounded-xl bg-gray-800 min-h-screen text-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
        <MdSupportAgent className="text-yellow-400 drop-shadow-lg" size={36} />
        Support
      </h2>

      {submitted && (
        <div className="bg-green-700/30 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
          ✅ Your message has been sent!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-900/70 backdrop-blur-sm border border-gray-700 p-6 rounded-xl shadow-lg mb-8"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Login Issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Describe your issue in detail..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transform transition font-medium w-full sm:w-auto"
        >
          <FaPaperPlane className="drop-shadow-md" /> Submit
        </button>
      </form>

      {/* Support History */}
      <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaHistory className="text-blue-400 drop-shadow-md" /> Support History
        </h3>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No previous messages.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md hover:bg-gray-700/40 transition"
              >
                <p className="font-semibold text-gray-200">{item.subject}</p>
                <p className="text-gray-300 text-sm mt-1">{item.message}</p>
                <span className="text-gray-500 text-xs block mt-2">
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TenantSupport;
