"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATALOG } from "@/lib/default-catalog";
import { normalizeCatalog } from "@/lib/catalog-schema";
import type { Catalog, CatalogSection } from "@/lib/types";

const newId = () => crypto.randomUUID();
const clone = <T,>(v: T): T => structuredClone(v);

type CatalogState = Catalog & {
  setIntro: (intro: string) => void;
  addSection: (title: string) => void;
  updateSection: (
    id: string,
    patch: Partial<Pick<CatalogSection, "title" | "defaultNote" | "pdfMode">>,
  ) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
  addItem: (sectionId: string, label: string) => void;
  renameItem: (sectionId: string, itemId: string, label: string) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  rememberQuestion: (itemId: string, question: string) => void;
  forgetQuestion: (itemId: string, question: string) => void;
  replaceCatalog: (catalog: Catalog) => void;
  resetToDefault: () => void;
};

export const useCatalog = create<CatalogState>()(
  persist(
    (set) => {
      const mapSection = (
        id: string,
        fn: (s: CatalogSection) => CatalogSection,
      ) =>
        set((st) => ({
          sections: st.sections.map((s) => (s.id === id ? fn(s) : s)),
        }));

      const mapAllItems = (
        itemId: string,
        fn: (q: string[]) => string[],
      ) =>
        set((st) => ({
          sections: st.sections.map((s) => ({
            ...s,
            items: s.items.map((it) =>
              it.id === itemId
                ? { ...it, savedQuestions: fn(it.savedQuestions) }
                : it,
            ),
          })),
        }));

      return {
        ...clone(DEFAULT_CATALOG),
        setIntro: (intro) => set({ intro }),
        addSection: (title) =>
          set((st) => ({
            sections: [
              ...st.sections,
              { id: newId(), title, defaultNote: "", pdfMode: "checklist", items: [] },
            ],
          })),
        updateSection: (id, patch) => mapSection(id, (s) => ({ ...s, ...patch })),
        removeSection: (id) =>
          set((st) => ({ sections: st.sections.filter((s) => s.id !== id) })),
        moveSection: (id, dir) =>
          set((st) => {
            const i = st.sections.findIndex((s) => s.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= st.sections.length) return st;
            const sections = [...st.sections];
            [sections[i], sections[j]] = [sections[j], sections[i]];
            return { sections };
          }),
        addItem: (sectionId, label) =>
          mapSection(sectionId, (s) => ({
            ...s,
            items: [...s.items, { id: newId(), label, savedQuestions: [] }],
          })),
        renameItem: (sectionId, itemId, label) =>
          mapSection(sectionId, (s) => ({
            ...s,
            items: s.items.map((it) => (it.id === itemId ? { ...it, label } : it)),
          })),
        removeItem: (sectionId, itemId) =>
          mapSection(sectionId, (s) => ({
            ...s,
            items: s.items.filter((it) => it.id !== itemId),
          })),
        rememberQuestion: (itemId, question) => {
          const q = question.trim();
          if (!q) return;
          mapAllItems(itemId, (list) => (list.includes(q) ? list : [...list, q]));
        },
        forgetQuestion: (itemId, question) =>
          mapAllItems(itemId, (list) => list.filter((x) => x !== question)),
        replaceCatalog: (catalog) => set(normalizeCatalog(clone(catalog))),
        resetToDefault: () => set(clone(DEFAULT_CATALOG)),
      };
    },
    {
      name: "atg-catalog",
      version: 2,
      // v1 sections had no pdfMode.
      migrate: (persisted) => normalizeCatalog(persisted as Catalog),
      partialize: (s) => ({ intro: s.intro, sections: s.sections }),
    },
  ),
);
