import { describe, expect, it } from "vitest";
import { buildSections, generate } from "./generate";
import type { Catalog, RequestDraft } from "./types";

const catalog: Catalog = {
  intro: "",
  sections: [
    {
      id: "a",
      title: "เอกสารของ{applicant}",
      defaultNote: "ขอส่งมาก่อน",
      pdfMode: "checklist",
      items: [
        { id: "pp", label: "Thai Passport", savedQuestions: [] },
        { id: "id", label: "บัตรประชาชนไทย", savedQuestions: [] },
      ],
    },
    {
      id: "b",
      title: "เอกสาร{sponsor}",
      defaultNote: "",
      pdfMode: "answer",
      items: [{ id: "au", label: "Australian Passport", savedQuestions: [] }],
    },
  ],
};

const draft = (over: Partial<RequestDraft> = {}): RequestDraft => ({
  applicantName: "ปาล์ม",
  sponsorName: "ฝน",
  intro: "",
  selected: {},
  sectionQuestions: {},
  sectionTitles: {},
  sectionNotes: {},
  ...over,
});

describe("generate", () => {
  it("renders ticked items with nested questions and fills tokens", () => {
    const { text } = generate(
      catalog,
      draft({
        intro: "สวัสดีครับ",
        selected: {
          pp: { questions: ["Have you visited somewhere?", "  "] },
          id: { questions: [] },
        },
      }),
    );
    expect(text).toBe(
      [
        "สวัสดีครับ",
        "",
        "เอกสารของปาล์ม ขอส่งมาก่อน",
        "☐ Thai Passport",
        "   - Have you visited somewhere?",
        "☐ บัตรประชาชนไทย",
      ].join("\n"),
    );
  });

  it("omits empty sections and includes standalone questions", () => {
    const { text } = generate(
      catalog,
      draft({ sectionQuestions: { b: ["ปีเกิดของ {sponsor}"] } }),
    );
    expect(text).toBe("เอกสารฝน\n☐ ปีเกิดของ ฝน");
  });

  it("uses per-request note override and placeholder for missing names", () => {
    const { text } = generate(
      catalog,
      draft({
        applicantName: " ",
        selected: { pp: { questions: [] } },
        sectionNotes: { a: "ด่วน" },
      }),
    );
    expect(text.split("\n")[0]).toBe("เอกสารของ{ผู้สมัคร} ด่วน");
  });

  it("uses a per-request section title, still filling tokens", () => {
    const { text } = generate(
      catalog,
      draft({
        selected: { au: { questions: [] } },
        sectionTitles: { b: "เอกสารคู่ของ{applicant}" },
      }),
    );
    expect(text).toBe("เอกสารคู่ของปาล์ม\n☐ Australian Passport");
  });

  it("escapes HTML", () => {
    const { html } = generate(
      catalog,
      draft({ sectionQuestions: { a: ["<script>x</script>"] } }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("tags entries by kind and carries the section pdfMode", () => {
    const sections = buildSections(
      catalog,
      draft({
        selected: { au: { questions: ["เคยมาออสเตรเลียไหม"] } },
        sectionQuestions: { b: ["ปีเกิด"] },
      }),
    );
    expect(sections).toEqual([
      {
        title: "เอกสารฝน",
        note: "",
        pdfMode: "answer",
        entries: [
          { kind: "item", label: "Australian Passport", questions: ["เคยมาออสเตรเลียไหม"] },
          { kind: "question", label: "ปีเกิด", questions: [] },
        ],
      },
    ]);
  });
});
