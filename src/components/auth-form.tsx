"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
          setError(registerResult.error || "Rejestracja nie powiodla sie.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Niepoprawny email lub haslo.");
        return;
      }

      router.push("/notes");
      router.refresh();
    } catch {
      setError("Wystapil blad. Sprobuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authCard">
      <h1>{mode === "login" ? "Zaloguj sie" : "Utworz konto"}</h1>
      <p className="authSubtitle">
        {mode === "login"
          ? "Po zalogowaniu otworzy sie Twoj notatnik."
          : "Zaloz konto i od razu zacznij notowac."}
      </p>

      <form onSubmit={onSubmit} className="authForm">
        {mode === "register" ? (
          <label>
            Imie
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
              placeholder="np. Wojtek"
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="twoj@email.com"
          />
        </label>

        <label>
          Haslo
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimum 8 znakow"
          />
        </label>

        {error ? <p className="errorText">{error}</p> : null}

        <button disabled={loading} className="primaryButton" type="submit">
          {loading
            ? "Prosze czekac..."
            : mode === "login"
              ? "Zaloguj"
              : "Zarejestruj"}
        </button>
      </form>

      <button
        type="button"
        className="ghostButton"
        onClick={() => {
          setMode((current) => (current === "login" ? "register" : "login"));
          setError(null);
        }}
      >
        {mode === "login"
          ? "Nie masz konta? Zarejestruj sie"
          : "Masz konto? Zaloguj sie"}
      </button>
    </div>
  );
}
