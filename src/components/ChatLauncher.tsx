"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "./LangProvider";
import { ChatView } from "./ChatView";
import { Sheet } from "./ui";

/** Sent to the home page, which switches to the screening wizard. */
export const START_SCREENING_EVENT = "cuore:start-screening";

/**
 * Floating "Ask CUORE" button on every page except /cup/*, where the same chat is a tab
 * that already knows which cup was scanned. The conversation lives only while the panel
 * is open: closing it unmounts the chat and erases the messages.
 */
export function ChatLauncher() {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  const startScreening = useCallback(() => {
    setOpen(false);
    if (pathname === "/") window.dispatchEvent(new Event(START_SCREENING_EVENT));
    else router.push("/#check");
  }, [pathname, router]);

  if (pathname.startsWith("/cup/")) return null;

  return (
    <>
      {/* Room at the bottom of the page so the button never covers the last lines. */}
      <div className="h-24" aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 min-h-14 rounded-full bg-accent px-6 text-lg font-bold text-white shadow-lg"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        {t.chat.open}
      </button>
      <Sheet open={open} onClose={close} title={t.chat.title}>
        <ChatView onStartScreening={startScreening} />
      </Sheet>
    </>
  );
}
