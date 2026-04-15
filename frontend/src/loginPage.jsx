import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

export default function LoginPage() {
    const [started, setStarted] = useState(false);
    const [input, setInput] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const chips = ["Summarize", "Code", "Explain", "Ideas"];

    const startApp = () => {
        if (!started) setStarted(true);
    };

    // ---------------- ACTIVE CHAT ----------------
    const activeChat = chats.find((c) => c.id === activeChatId);
    const messages = activeChat ? activeChat.messages : [];

    // ---------------- CREATE CHAT ----------------
    const createNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: "New Chat",
            messages: [],
        };

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setStarted(true);

        return newChat.id;
    };

    // ---------------- ADD MESSAGE ----------------
    const addMessage = (text, type, chatId) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, {text, type}],
                    }
                    : chat
            )
        );
    };

    // ---------------- SEND MESSAGE ----------------
    const handleSend = () => {
        if (input.trim() === "") return;
        setIsTyping(false)
        startApp();

        let chatId = activeChatId;

        // if no chat → create one
        if (!chatId) {
            chatId = createNewChat();
        }

        const userText = input;

        addMessage(userText, "user", chatId);

        setInput("");
        setLoading(true);

        setTimeout(async () => {
            try {
                const res = await axios.post("http://0.0.0.0:8000/query", {
                    query: userText,
                });

                const reply = res.data.answer;

                addMessage(reply, "ai", chatId);
            } catch (err) {
                console.log(err);
                addMessage("⚠️ Error getting response from server", "ai", chatId);
            }

            setLoading(false);
        }, 900);
    };

    // ---------------- CHIP CLICK ----------------
    const handleChipClick = (chip) => {
        startApp();

        let chatId = activeChatId;

        if (!chatId) {
            chatId = createNewChat();
        }

        addMessage("Selected: " + chip, "user", chatId);

        setLoading(true);

        setTimeout(() => {
            const reply = generateAIResponse(chip);
            addMessage(reply, "ai", chatId);
            setLoading(false);
        }, 800);
    };

    // ---------------- SIMPLE AI ----------------
    const generateAIResponse = (text) => {
        const t = text.toLowerCase();

        if (t.includes("summarize")) {
            return "📌 Summary: I have condensed your topic into key points.";
        }

        if (t.includes("code")) {
            return "💻 Code Example:\n\nfunction hello() {\n  return 'Hello World';\n}";
        }

        if (t.includes("explain")) {
            return "🧠 Explanation: Let me break this down step-by-step.";
        }

        if (t.includes("ideas")) {
            return "💡 Ideas:\n1. Build portfolio\n2. Learn React\n3. Create AI apps";
        }

        return "⚡ I understood your message.";
    };

    // ---------------- NEW CHAT CLICK ----------------
    const handleNewChat = () => {
        createNewChat();
    };

    return (
        <div className="app">

            {/!* BACKGROUND *!/}
            <div className="bg"></div>

            {/!* SIDEBAR *!/}
            <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>


                {sidebarOpen && (
                    <>
                        <div className="top-actions">
                            <div className="logo">⚡ Atharv AI</div>
                        </div>

                        {/!* NEW CHAT *!/}
                        <div className="newchat" onClick={handleNewChat}>
                            + New Chat
                        </div>

                        {/!* HISTORY *!/}
                        <div className="history-list">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className="history"
                                    onClick={() => setActiveChatId(chat.id)}
                                >
                                    {chat.title}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/!* MAIN *!/}
            <div className="main">

                <div className="top">Atharv AI Assistant</div>

                {/!* CHAT *!/}
                <div className="chat">

                    {messages.map((msg, i) => (
                        <div key={i} className={`msg ${msg.type}`}>
                            {msg.type === "ai" ? (
                                <div className="code-box">
                                    <button
                                        className="copy-btn"
                                        onClick={() =>
                                            navigator.clipboard.writeText(msg.text)
                                        }
                                    >
                                        ⧉
                                    </button>

                                    <pre>{msg.text}</pre>
                                </div>
                            ) : (
                                <div>{msg.text}</div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="msg ai">
                            ⚡ AI is thinking...
                        </div>
                    )}
                </div>

                {/!* INPUT *!/}
                <div className={`input-area ${started ? "active" : ""}`}>
                    <div className="input-box">
                        <input
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setIsTyping(e.target.value.length > 0);
                            }}
                            placeholder="Message AI..."
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSend()
                            }
                        />

                        <button className="send-btn" onClick={handleSend} style={{"color": "black"}}>
                            ➤
                        </button>
                    </div>
                </div>
            </div>

            {/!* WELCOME *!/}
            {!started && (
                <div className="welcome">
                    <div className="card">
                        <h2>Hey 👋</h2>
                        <p style={{color: "#aaa"}}>
                            How can I help you today?
                        </p>

                        <div className="chips">
                            {chips.map((chip, i) => (
                                <div
                                    key={i}
                                    className="chip"
                                    onClick={() => handleChipClick(chip)}
                                >
                                    {chip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}