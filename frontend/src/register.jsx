import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./login.css";

export default function Register({ onSuccess, onGoLogin }) {
    const canvasRef = useRef(null);

    const [typedText, setTypedText] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const fullText =
        "Create your account and start using next-generation AI assistant.";

    // ---------------- TYPING EFFECT ----------------
    useEffect(() => {
        let i = 0;

        const type = () => {
            if (i <= fullText.length) {
                setTypedText(fullText.substring(0, i));
                i++;
                setTimeout(type, 25);
            }
        };

        type();
    }, []);

    // ---------------- REGISTER API ----------------
    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            return alert("Fill all fields");
        }

        if (password !== confirmPassword) {
            return alert("Passwords do not match");
        }

        setLoading(true);

        try {
            const res = await axios.post("http://0.0.0.0:8000/register", {
                email,
                password,
            });

            if (res.data.success) {
                alert("Account created successfully 🎉");
                onSuccess && onSuccess();
            } else {
                alert("Registration failed");
            }
        } catch (err) {
            console.log(err);
            alert("Server error");
        }

        setLoading(false);
    };

    // ---------------- CANVAS (same as login) ----------------
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);

        const nodes = [];
        const NODE_COUNT = 70;

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                r: Math.random() * 2 + 1,
            });
        }

        let mouse = { x: null, y: null };

        window.addEventListener("mousemove", (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            for (let n of nodes) {
                n.x += n.vx;
                n.y += n.vy;

                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                if (mouse.x) {
                    let dx = n.x - mouse.x;
                    let dy = n.y - mouse.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        n.x += dx * 0.01;
                        n.y += dy * 0.01;
                    }
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(120,180,255,0.8)";
                ctx.fill();
            }

            requestAnimationFrame(draw);
        };

        draw();

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <div className="login-page">

            <canvas ref={canvasRef} id="bg" />

            <div className="wrapper">

                {/* LEFT */}
                <div className="left">
                    <h1>AI Assistant</h1>
                    <p>
                        {typedText}
                        <span className="cursor"></span>
                    </p>
                </div>

                {/* RIGHT */}
                <div className="right">
                    <div className="card">

                        <h2>Register</h2>

                        <div className="field">
                            <label>Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="field">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>

                        <div className="field">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                            />
                        </div>

                        <button onClick={handleRegister} disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </button>

                        <button
                            onClick={onGoLogin}
                            style={{
                                marginTop: "10px",
                                background: "#444",
                                color: "white",
                            }}
                        >
                            Back to Login
                        </button>

                    </div>
                </div>

            </div>

            <div className="credit">
                Created by Atharv Satpute
            </div>
        </div>
    );
}