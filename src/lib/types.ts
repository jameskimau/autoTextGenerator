export type CatalogItem = {
  id: string;
  label: string;
  /** Questions previously asked about this item, offered as one-click suggestions. */
  savedQuestions: string[];
};

/** How a section's ticked items appear in the questionnaire PDF. */
export type PdfMode = "answer" | "checklist";

export type CatalogSection = {
  id: string;
  /** May contain {applicant} / {sponsor} tokens. */
  title: string;
  /** Default priority note shown after the title, e.g. "ขอส่งมาก่อน". */
  defaultNote: string;
  /** "answer": each item gets lines to write on; "checklist": each item gets a tick box. */
  pdfMode: PdfMode;
  items: CatalogItem[];
};

export type Catalog = {
  intro: string;
  sections: CatalogSection[];
};

export type SelectedItem = { questions: string[] };

export type RequestDraft = {
  applicantName: string;
  sponsorName: string;
  intro: string;
  /** Ticked items keyed by item id, with their sub-questions. */
  selected: Record<string, SelectedItem>;
  /** Free-standing questions per section id. */
  sectionQuestions: Record<string, string[]>;
  /** Per-request section heading per section id (falls back to section.title with tokens filled). */
  sectionTitles: Record<string, string>;
  /** Per-request priority note per section id (falls back to section.defaultNote). */
  sectionNotes: Record<string, string>;
};
