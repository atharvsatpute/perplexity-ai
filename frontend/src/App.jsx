import {useEffect, useRef, useState} from "react";
import "./login.css";
import LoginPage from "./loginPage";
import Register from "./register";
import axios from "axios";

export default function Login() {
    const canvasRef = useRef(null);

    const [typedText, setTypedText] = useState("");
    const [page, setPage] = useState("login");

    // ---------------- ADDED STATES (LOGIN) ----------------
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fullText =
        "Experience next-generation AI search with intelligent, fast and contextual responses.";

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

    // ---------------- CANVAS BACKGROUND ----------------
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

        let mouse = {x: null, y: null};

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

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let a = nodes[i];
                    let b = nodes[j];

                    let dx = a.x - b.x;
                    let dy = a.y - b.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = "rgba(120,180,255,0.08)";
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        };

        draw();

        return () => window.removeEventListener("resize", resize);
    }, []);

    // ---------------- LOGIN FUNCTION (ADDED) ----------------
    const handleLogin = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.post("http://127.0.0.1:8000/login", {
                email,
                password,
            });

            if (res.data.success) {
                setPage("app");
                console.log("Current page:", page);
                localStorage.setItem("user", JSON.stringify(res.data.user));

            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError("Server error");
        }

        setLoading(false);
    };

    // ---------------- ROUTING ----------------
    if (page === "register") {
        return <Register onBack={() => setPage("login")}/>;
    }
    if (page === "app") {
        return <LoginPage></LoginPage>;
    }

    return (
        <div className="login-page">

            <canvas ref={canvasRef} id="bg"/>

            <div className="wrapper">

                {/* LEFT SIDE */}
                <div className="left">
                    <h1>AI Assistant</h1>
                    <p>
                        {typedText}
                        <span className="cursor"></span>
                    </p>
                </div>

                {/* RIGHT SIDE CARD */}
                <div className="right">
                    <div className="card">

                        <h2>Login</h2>

                        {/* EMAIL */}
                        <div className="field">
                            <label className="label-left">Email</label>
                            <input
                                type="text"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="field">
                            <label className="label-left">Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* LOGIN BUTTON */}
                        <button onClick={handleLogin}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {/* ERROR */}
                        {error && (
                            <p style={{color: "red", marginTop: "10px"}}>
                                {error}
                            </p>
                        )}

                        {/* REGISTER BUTTON */}
                        <button
                            onClick={() => setPage("register")}
                            style={{
                                marginTop: "10px",
                                background: "#444",
                                color: "white",
                            }}
                        >
                            Register
                        </button>

                        <div className="divider">OR</div>

                        <div className="social">
                            <button className="social-btn">Google</button>
                            <button className="social-btn">Apple</button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="credit">
                Created by Atharv Satpute
            </div>
        </div>


    );
}