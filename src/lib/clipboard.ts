/** Copies rich text (for Gmail) and plain text together; falls back to plain text only. */
export async function copyRichText(html: string, text: string): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      return;
    } catch {
      // Some browsers reject text/html; fall through to plain text.
    }
  }
  await navigator.clipboard.writeText(text);
}
