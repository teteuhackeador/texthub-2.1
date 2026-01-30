import { useEffect } from "react";

/**
 * Global keyboard shortcut:
 * - Pressing Enter triggers the primary "Process" action across tools.
 * - Does NOT intercept Enter inside <textarea> (so users can add new lines).
 *
 * Convention: any primary process button should include: data-process="true".
 */
const GlobalEnterToProcess = () => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.defaultPrevented) return;
      if (e.isComposing) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Never hijack Enter inside textarea/contenteditable.
      const tag = target.tagName;
      if (tag === "TEXTAREA") return;
      if (target.getAttribute("contenteditable") === "true") return;

      // If the focus is on a text-like input, Enter should trigger process.
      // (We prevent default to avoid accidental form submits / reloads.)
      if (tag === "INPUT" || tag === "SELECT") {
        e.preventDefault();
      }

      const processButton = document.querySelector<HTMLButtonElement>(
        'button[data-process="true"]:not([disabled])'
      );

      processButton?.click();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return null;
};

export default GlobalEnterToProcess;
