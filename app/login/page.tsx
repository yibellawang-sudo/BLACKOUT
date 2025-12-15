"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) {
      handleAuth();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0c1e3a 30%, #0f2744 60%, #1a1f3a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Ningrat', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1d2e",
          padding: "2rem",
          borderRadius: "1rem",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h1
          style={{
            color: "#fff",
            marginBottom: "2rem",
            textAlign: "center",
            fontFamily: "'Chopsic', sans-serif",
            fontSize: "2rem",
          }}
        >
          {isSignUp ? "Sign Up" : "Login"}
        </h1>

        <div onKeyPress={handleKeyPress}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "#a3a3a3", marginBottom: "0.5rem" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#fff",
                fontFamily: "'Ningrat', sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#a3a3a3", marginBottom: "0.5rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#fff",
                fontFamily: "'Ningrat', sans-serif",
              }}
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "rgba(96, 165, 250, 0.2)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              borderRadius: "0.5rem",
              color: "#fff",
              cursor: loading || !email || !password ? "not-allowed" : "pointer",
              fontFamily: "'Ningrat', sans-serif",
              marginBottom: "1rem",
              opacity: loading || !email || !password ? 0.5 : 1,
            }}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </div>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "transparent",
            border: "none",
            color: "#60a5fa",
            cursor: "pointer",
            fontFamily: "'Ningrat', sans-serif",
          }}
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}