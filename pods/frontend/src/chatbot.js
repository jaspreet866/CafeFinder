import { useState } from "react"
import { FaComments, FaPaperPlane, FaRobot, FaTimes } from "react-icons/fa"

export const Chatbot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I am your WorkWave assistant. How can I help?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = { from: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const result = await fetch("http://localhost:9000/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
        headers: {
          "Content-type": "application/json;charset=UTF-8"
        }
      })

      const res = await result.json()

      if (res.statuscode === 1) {
        setMessages((prev) => [...prev, { from: "bot", text: res.reply }])
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: res.message || "Sorry, I could not reply right now." }
        ])
      }
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "Server error. Please try again." }])
    }

    setLoading(false)
  }

  return (
    <div className="chatbot">
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <FaRobot />
            </div>
            <div>
              <h3>WorkWave Assistant</h3>
              <span>Online now</span>
            </div>
            <button
              className="chatbot-close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.from}`}>
                {msg.text}
              </div>
            ))}

            {loading && <div className="chat-msg bot">Typing...</div>}
          </div>

          <form className="chatbot-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" aria-label="Send message">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <FaTimes /> : <FaComments />}
      </button>
    </div>
  )
}
