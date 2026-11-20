"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { chipRef, classify, MAX_INPUT, renderReply, type ReplyRef } from "@/lib/chat/engine";
import { KNOWLEDGE, PRIMARY_CHIPS } from "@/lib/chat/knowledge";
import type { IntentId } from "@/lib/chat/types";
import { DISCLAIMER, type ModuleId } from "@/lib/recommender";
import { useLang } from "./LangProvider";

/**
 * Rule-based product Q&A (sprint T-04). Runs entirely on the device: no network and no
 * storage. Messages live in React state only, so closing the panel or leaving the page
 * erases the conversation. Replies are kept as language-independent references and rendered
 * in the current language, so switching language also switches the earlier answers.
 */

type Message = { id: number; from: "user"; text: string } | { id: number; from: "bot"; ref: ReplyRef };

/** Intents whose answer should come with a button to the screening. */
const SCREENING = "screening.start" as const;

export function ChatView({
  module,
  onStartScreening,
  listClassName = "max-h-[48dvh] min-h-40",
}: {
  /** The cup the user scanned, used as context for the answers. */
  module?: ModuleId;
  onStartScreening: () => void;
  listClassName?: string;
}) {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Show the newest answer from its first line, not its last: a long reply (above all the
  // emergency message) must be read from the start.
  useEffect(() => {
    const el = listRef.current;
    const newest = el?.lastElementChild;
    if (!el || !(newest instanceof HTMLElement) || messages.length === 0) return;
    el.scrollTo({ top: Math.max(0, newest.offsetTop - 8), behavior: reduced ? "auto" : "smooth" });
  }, [messages, reduced]);

  const push = (user: Message | null, ref: ReplyRef) =>
    setMessages((m) => [
      ...m,
      ...(user ? [user] : []),
      { id: nextId.current++, from: "bot" as const, ref },
    ]);

  const askText = (text: string) => {
    const clean = text.trim().slice(0, MAX_INPUT);
    if (!clean) return;
    push({ id: nextId.current++, from: "user", text: clean }, classify(clean, { module }));
  };

  const askChip = (id: IntentId) => {
    push({ id: nextId.current++, from: "user", text: KNOWLEDGE[id].chip[lang] }, chipRef(id, { module }));
  };

  const last = [...messages].reverse().find((m): m is Extract<Message, { from: "bot" }> => m.from === "bot");
  const lastReply = last ? renderReply(last.ref, lang) : null;

  // Chips for the next question: follow-ups of the last answer, or the five main topics at the start.
  const chipIds = (lastReply ? lastReply.followUps : PRIMARY_CHIPS).filter((id) => {
    const scope = KNOWLEDGE[id].moduleScope;
    return scope === "all" || !module || scope.includes(module);
  });
  const showScreening = lastReply ? lastReply.intent === SCREENING || lastReply.followUps.includes(SCREENING) : false;
  const quickChips = chipIds.filter((id) => id !== SCREENING);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t.chat.title}
        className={`relative flex flex-col gap-3 overflow-y-auto rounded-2xl bg-bg p-3 ${listClassName}`}
      >
        <p className="text-base text-muted">{t.chat.intro}</p>
        {messages.map((m) =>
          m.from === "user" ? (
            <motion.div
              key={m.id}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-base font-semibold text-white"
            >
              <span className="sr-only">{t.chat.you}: </span>
              {m.text}
            </motion.div>
          ) : (
            <BotBubble key={m.id} reference={m.ref} animate={!reduced} />
          ),
        )}
      </div>

      {showScreening && (
        <button
          type="button"
          onClick={onStartScreening}
          className="min-h-12 rounded-full bg-accent px-5 text-base font-bold text-white"
        >
          {t.chat.screeningCta}
        </button>
      )}

      {quickChips.length > 0 && (
        <div role="group" aria-label={t.chat.chipsLabel} className="flex flex-wrap gap-2">
          {quickChips.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => askChip(id)}
              className="min-h-12 rounded-full border-2 border-accent bg-surface px-4 text-left text-base font-semibold text-accent-ink"
            >
              {KNOWLEDGE[id].chip[lang]}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          askText(draft);
          setDraft("");
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="chat-input" className="text-sm font-semibold text-muted">
          {t.chat.inputLabel}
        </label>
        <div className="flex gap-2">
          <input
            id="chat-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_INPUT}
            autoComplete="off"
            enterKeyHint="send"
            placeholder={t.chat.placeholder}
            className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 text-base text-fg"
          />
          <button
            type="submit"
            className="min-h-12 rounded-full bg-accent px-5 text-base font-bold text-white disabled:opacity-50"
            disabled={draft.trim().length === 0}
          >
            {t.chat.send}
          </button>
        </div>
      </form>

      <p className="text-center text-sm font-semibold text-muted">{DISCLAIMER[lang]}</p>
      <p className="text-center text-sm text-muted">{t.chat.footerRule}</p>
    </div>
  );
}

function BotBubble({ reference, animate }: { reference: ReplyRef; animate: boolean }) {
  const { t, lang } = useLang();
  const reply = renderReply(reference, lang);
  const emergency = reply.reason === "triage";
  // Heart content is a draft until the clinician has reviewed it (not shown on the fixed emergency message).
  const draft = !emergency && reply.intent.startsWith("heart.") && reply.status === "draft";
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={`mr-auto max-w-[92%] space-y-2 rounded-2xl rounded-bl-md px-4 py-3 text-base text-fg ${
        emergency ? "border-4 border-accent bg-accent-soft font-semibold" : "border-2 border-line bg-surface"
      }`}
    >
      <span className="sr-only">{t.chat.bot}: </span>
      {emergency && <p className="text-lg font-extrabold text-accent-ink">{t.chat.emergencyLabel}</p>}
      {reply.lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      {draft && <p className="text-sm italic text-muted">{t.chat.draftNote}</p>}
    </motion.div>
  );
}
