"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATALOG } from "@/lib/default-catalog";
import type { RequestDraft } from "@/lib/types";

const emptyDraft = (intro: string): RequestDraft => ({
  applicantName: "",
  sponsorName: "",
  intro,
  selected: {},
  sectionQuestions: {},
  sectionNotes: {},
});

type DraftState = RequestDraft & {
  setField: (
    field: "applicantName" | "sponsorName" | "intro",
    value: string,
  ) => void;
  toggleItem: (itemId: string, on: boolean) => void;
  addItemQuestion: (itemId: string, question?: string) => void;
  updateItemQuestion: (itemId: string, index: number, value: string) => void;
  removeItemQuestion: (itemId: string, index: number) => void;
  addSectionQuestion: (sectionId: string) => void;
  updateSectionQuestion: (sectionId: string, index: number, value: string) => void;
  removeSectionQuestion: (sectionId: string, index: number) => void;
  setSectionNote: (sectionId: string, note: string) => void;
  reset: (intro: string) => void;
};

export const useDraft = create<DraftState>()(
  persist(
    (set) => {
      const editItemQs = (itemId: string, fn: (q: string[]) => string[]) =>
        set((st) => {
          const cur = st.selected[itemId];
          if (!cur) return st;
          return {
            selected: { ...st.selected, [itemId]: { questions: fn(cur.questions) } },
          };
        });
      const editSectionQs = (sectionId: string, fn: (q: string[]) => string[]) =>
        set((st) => ({
          sectionQuestions: {
            ...st.sectionQuestions,
            [sectionId]: fn(st.sectionQuestions[sectionId] ?? []),
          },
        }));

      return {
        ...emptyDraft(DEFAULT_CATALOG.intro),
        setField: (field, value) => set({ [field]: value }),
        toggleItem: (itemId, on) =>
          set((st) => {
            const selected = { ...st.selected };
            if (on) selected[itemId] = selected[itemId] ?? { questions: [] };
            else delete selected[itemId];
            return { selected };
          }),
        addItemQuestion: (itemId, question = "") =>
          editItemQs(itemId, (q) => [...q, question]),
        updateItemQuestion: (itemId, index, value) =>
          editItemQs(itemId, (q) => q.map((x, i) => (i === index ? value : x))),
        removeItemQuestion: (itemId, index) =>
          editItemQs(itemId, (q) => q.filter((_, i) => i !== index)),
        addSectionQuestion: (sectionId) => editSectionQs(sectionId, (q) => [...q, ""]),
        updateSectionQuestion: (sectionId, index, value) =>
          editSectionQs(sectionId, (q) => q.map((x, i) => (i === index ? value : x))),
        removeSectionQuestion: (sectionId, index) =>
          editSectionQs(sectionId, (q) => q.filter((_, i) => i !== index)),
        setSectionNote: (sectionId, note) =>
          set((st) => ({ sectionNotes: { ...st.sectionNotes, [sectionId]: note } })),
        reset: (intro) => set(emptyDraft(intro)),
      };
    },
    {
      name: "atg-draft",
      version: 1,
      partialize: (s): RequestDraft => ({
        applicantName: s.applicantName,
        sponsorName: s.sponsorName,
        intro: s.intro,
        selected: s.selected,
        sectionQuestions: s.sectionQuestions,
        sectionNotes: s.sectionNotes,
      }),
    },
  ),
);
