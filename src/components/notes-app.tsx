/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Gotowe");

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const loadNotes = useCallback(async (q?: string) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    const response = await fetch(`/api/notes?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { notes: Note[] };
    setNotes(data.notes);

    if (data.notes.length === 0) {
      setSelectedId(null);
      setTitle("");
      setContent("");
      return;
    }

    const shouldKeepSelection = data.notes.some((note) => note.id === selectedId);
    const nextSelectedId = shouldKeepSelection ? selectedId : data.notes[0].id;
    setSelectedId(nextSelectedId ?? null);

    const current = data.notes.find((note) => note.id === nextSelectedId);
    if (current) {
      setTitle(current.title);
      setContent(current.content);
      setDirty(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadNotes(query.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadNotes, query]);

  useEffect(() => {
    if (!selectedId || !dirty) {
      return;
    }

    setSaveStatus("Zapisywanie...");

    const timeout = setTimeout(async () => {
      const response = await fetch(`/api/notes/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        setSaveStatus("Zapisano automatycznie");
        setDirty(false);
        await loadNotes(query.trim());
      } else {
        setSaveStatus("Blad zapisu");
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content, dirty, loadNotes, query, selectedId, title]);

  const createNote = async () => {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nowa notatka", content: "" }),
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { note: Note };
    setNotes((current) => [data.note, ...current]);
    setSelectedId(data.note.id);
    setTitle(data.note.title);
    setContent(data.note.content);
    setDirty(false);
    setSaveStatus("Gotowe");
  };

  const deleteNote = async () => {
    if (!selectedId) {
      return;
    }

    const shouldDelete = window.confirm("Na pewno usunac notatke?");
    if (!shouldDelete) {
      return;
    }

    const response = await fetch(`/api/notes/${selectedId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    await loadNotes(query.trim());
  };

  return (
    <div className="notesLayout">
      <aside className="sidebar">
        <div className="sidebarTop">
          <h2>Twoje notatki</h2>
          <button className="primaryButton" onClick={createNote} type="button">
            + Nowa
          </button>
        </div>

        <input
          className="searchInput"
          placeholder="Szukaj po tytule i tresci"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="notesList">
          {notes.map((note) => (
            <button
              key={note.id}
              className={`noteItem ${note.id === selectedId ? "active" : ""}`}
              onClick={() => {
                setSelectedId(note.id);
                setTitle(note.title);
                setContent(note.content);
                setDirty(false);
                setSaveStatus("Gotowe");
              }}
              type="button"
            >
              <strong>{note.title}</strong>
              <span>{new Date(note.updatedAt).toLocaleString("pl-PL")}</span>
            </button>
          ))}
        </div>

        <button className="ghostButton" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
          Wyloguj
        </button>
      </aside>

      <main className="editorArea">
        {selectedNote ? (
          <>
            <div className="editorHeader">
              <input
                className="titleInput"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                maxLength={120}
              />
              <button className="dangerButton" type="button" onClick={deleteNote}>
                Usun
              </button>
            </div>

            <p className="saveStatus">{saveStatus}</p>

            <div className="editorGrid">
              <textarea
                className="markdownInput"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                placeholder="Pisz w Markdown..."
              />
              <div className="previewPane">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_Podglad notatki_"}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="emptyState">
            <h3>Brak notatek</h3>
            <p>Utworz pierwsza notatke, aby zaczac.</p>
            <button className="primaryButton" onClick={createNote} type="button">
              Utworz notatke
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
