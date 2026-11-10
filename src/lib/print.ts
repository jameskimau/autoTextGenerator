/**
 * Opens the browser print dialog. Only the .print-root questionnaire is printed
 * (see globals.css); the user picks "Save as PDF" as the destination.
 */
export function printQuestionnaire(fileTitle: string) {
  const previous = document.title;
  document.title = fileTitle; // Chrome uses this as the default PDF file name.
  window.addEventListener(
    "afterprint",
    () => {
      document.title = previous;
    },
    { once: true },
  );
  window.print();
}
