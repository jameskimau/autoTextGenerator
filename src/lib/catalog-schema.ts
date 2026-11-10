import type { Catalog, PdfMode } from "./types";

// Kept out of the store module: persist's migrate runs while the store is being
// created, so helpers declared below create() would still be uninitialised.

const isPdfMode = (v: unknown): v is PdfMode =>
  v === "answer" || v === "checklist";

/** Fills fields added after v1 so older saved/exported catalogs keep working. */
export function normalizeCatalog(catalog: Catalog): Catalog {
  return {
    intro: catalog.intro,
    sections: catalog.sections.map((s) => ({
      ...s,
      pdfMode: isPdfMode(s.pdfMode)
        ? s.pdfMode
        : s.id === "applicant-info"
          ? "answer"
          : "checklist",
    })),
  };
}

export function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const v = value as Catalog;
  return (
    typeof v.intro === "string" &&
    Array.isArray(v.sections) &&
    v.sections.every(
      (s) =>
        typeof s.id === "string" &&
        typeof s.title === "string" &&
        typeof s.defaultNote === "string" &&
        (s.pdfMode === undefined || isPdfMode(s.pdfMode)) &&
        Array.isArray(s.items) &&
        s.items.every(
          (it) =>
            typeof it.id === "string" &&
            typeof it.label === "string" &&
            Array.isArray(it.savedQuestions) &&
            it.savedQuestions.every((q) => typeof q === "string"),
        ),
    )
  );
}
