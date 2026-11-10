import { describe, expect, it } from "vitest";
import { generate } from "./generate";
import type { Catalog, RequestDraft } from "./types";

const catalog: Catalog = {
  intro: "",
  sections: [
    {
      id: "a",
      title: "เอกสารของ{applicant}",
      defaultNote: "ขอส่งมาก่อน",
      items: [
        { id: "pp", label: "Thai Passport", savedQuestions: [] },
        { id: "id", label: "บัตรประชาชนไทย", savedQuestions: [] },
      ],
    },
    {
      id: "b",
      title: "เอกสาร{sponsor}",
      defaultNote: "",
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
        "- Thai Passport",
        "   - Have you visited somewhere?",
        "- บัตรประชาชนไทย",
      ].join("\n"),
    );
  });

  it("omits empty sections and includes standalone questions", () => {
    const { text } = generate(
      catalog,
      draft({ sectionQuestions: { b: ["ปีเกิดของ {sponsor}"] } }),
    );
    expect(text).toBe("เอกสารฝน\n- ปีเกิดของ ฝน");
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

  it("escapes HTML", () => {
    const { html } = generate(
      catalog,
      draft({ sectionQuestions: { a: ["<script>x</script>"] } }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
