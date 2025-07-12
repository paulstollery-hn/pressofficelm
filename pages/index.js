import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .order("created_at", { ascending: false });
    if (!error) setMessages(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase.from("messages").insert({ text });
    if (!error) {
      setText("");
      fetchMessages();
    }
  }

  useEffect(() => { fetchMessages(); }, []);

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "2rem auto" }}>
      <h1>Pressofficelm (Next.js)</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          required
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Send
        </button>
      </form>

      <h2>Messages</h2>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
    </main>
  );
}
