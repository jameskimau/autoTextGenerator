import type { Catalog, RequestDraft } from "./types";

export const APPLICANT_PLACEHOLDER = "{ผู้สมัคร}";
export const SPONSOR_PLACEHOLDER = "{ผู้สนับสนุน}";

export function fillTokens(
  text: string,
  draft: Pick<RequestDraft, "applicantName" | "sponsorName">,
): string {
  const applicant = draft.applicantName.trim() || APPLICANT_PLACEHOLDER;
  const sponsor = draft.sponsorName.trim() || SPONSOR_PLACEHOLDER;
  return text
    .replaceAll("{applicant}", applicant)
    .replaceAll("{sponsor}", sponsor);
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type OutputEntry = { label: string; questions: string[] };
type OutputSection = { title: string; note: string; entries: OutputEntry[] };

export function buildSections(
  catalog: Catalog,
  draft: RequestDraft,
): OutputSection[] {
  const clean = (list: string[] | undefined) =>
    (list ?? []).map((q) => fillTokens(q.trim(), draft)).filter(Boolean);

  return catalog.sections
    .map((section) => {
      const entries: OutputEntry[] = section.items
        .filter((it) => draft.selected[it.id] && it.label.trim())
        .map((it) => ({
          label: fillTokens(it.label, draft),
          questions: clean(draft.selected[it.id].questions),
        }));
      for (const q of clean(draft.sectionQuestions[section.id])) {
        entries.push({ label: q, questions: [] });
      }
      return {
        title: fillTokens(section.title, draft),
        note: (draft.sectionNotes[section.id] ?? section.defaultNote ?? "").trim(),
        entries,
      };
    })
    .filter((s) => s.entries.length > 0);
}

export function generate(
  catalog: Catalog,
  draft: RequestDraft,
): { text: string; html: string } {
  const sections = buildSections(catalog, draft);
  const intro = fillTokens(draft.intro.trim(), draft);

  const textBlocks: string[] = [];
  const htmlBlocks: string[] = [];

  if (intro) {
    textBlocks.push(intro);
    htmlBlocks.push(`<p>${escapeHtml(intro).replaceAll("\n", "<br>")}</p>`);
  }

  for (const s of sections) {
    const heading = s.note ? `${s.title} ${s.note}` : s.title;
    const lines = [heading];
    for (const e of s.entries) {
      lines.push(`- ${e.label}`);
      for (const q of e.questions) lines.push(`   - ${q}`);
    }
    textBlocks.push(lines.join("\n"));

    const noteHtml = s.note
      ? ` <b style="color:#c00000">${escapeHtml(s.note)}</b>`
      : "";
    const items = s.entries
      .map((e) => {
        const sub = e.questions.length
          ? `<ul>${e.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>`
          : "";
        return `<li>${escapeHtml(e.label)}${sub}</li>`;
      })
      .join("");
    htmlBlocks.push(
      `<p style="margin-bottom:0"><b>${escapeHtml(s.title)}</b>${noteHtml}</p><ul style="margin-top:4px">${items}</ul>`,
    );
  }

  return { text: textBlocks.join("\n\n"), html: htmlBlocks.join("") };
}
