"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ItemRow } from "@/components/item-row";
import { QuestionList } from "@/components/question-list";
import { fillTokens } from "@/lib/generate";
import type { CatalogSection } from "@/lib/types";
import { useCatalog } from "@/store/catalog-store";
import { useDraft } from "@/store/draft-store";

type Props = {
  section: CatalogSection;
  editMode: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export function SectionCard({ section, editMode, isFirst, isLast }: Props) {
  const draft = useDraft();
  const catalog = useCatalog();
  const [newItem, setNewItem] = useState("");
  const note = draft.sectionNotes[section.id] ?? section.defaultNote;
  const customTitle = draft.sectionTitles[section.id];
  const standalone = draft.sectionQuestions[section.id] ?? [];
  const count =
    section.items.filter((it) => draft.selected[it.id]).length +
    standalone.filter((q) => q.trim()).length;

  const addItem = () => {
    const label = newItem.trim();
    if (!label) return;
    catalog.addItem(section.id, label);
    setNewItem("");
  };

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        {editMode ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Input
                value={section.title}
                onChange={(e) =>
                  catalog.updateSection(section.id, { title: e.target.value })
                }
                className="h-9 font-semibold"
                aria-label="ชื่อหมวด"
              />
              <Button
                variant="ghost"
                size="icon"
                disabled={isFirst}
                aria-label="เลื่อนขึ้น"
                onClick={() => catalog.moveSection(section.id, -1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isLast}
                aria-label="เลื่อนลง"
                onClick={() => catalog.moveSection(section.id, 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                aria-label="ลบหมวด"
                onClick={() => {
                  if (confirm(`ลบหมวด "${section.title}" ?`)) {
                    section.items.forEach((it) => draft.toggleItem(it.id, false));
                    catalog.removeSection(section.id);
                  }
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Input
              value={section.defaultNote}
              onChange={(e) =>
                catalog.updateSection(section.id, { defaultNote: e.target.value })
              }
              placeholder="หมายเหตุเริ่มต้น เช่น ขอส่งมาก่อน"
              className="h-8 text-sm"
              aria-label="หมายเหตุเริ่มต้น"
            />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ในแบบสอบถาม PDF:</span>
              <select
                value={section.pdfMode}
                onChange={(e) =>
                  catalog.updateSection(section.id, {
                    pdfMode: e.target.value as CatalogSection["pdfMode"],
                  })
                }
                className="h-8 rounded-md border bg-background px-2 text-sm"
              >
                <option value="answer">มีช่องเขียนคำตอบ</option>
                <option value="checklist">ช่องติ๊ก (เอกสาร)</option>
              </select>
            </label>
            <p className="text-xs text-muted-foreground">
              ใช้ {"{applicant}"} และ {"{sponsor}"} แทนชื่อผู้สมัคร / ผู้สนับสนุน
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Input
                value={customTitle ?? fillTokens(section.title, draft)}
                onChange={(e) => draft.setSectionTitle(section.id, e.target.value)}
                aria-label="หัวข้อหมวด (แก้ได้เฉพาะคำขอนี้)"
                title="แก้หัวข้อได้เฉพาะคำขอนี้"
                className="h-8 min-w-40 border-transparent px-1.5 font-semibold shadow-none [field-sizing:content] hover:border-input focus-visible:border-ring"
              />
              {customTitle !== undefined && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  aria-label="ใช้หัวข้อเดิม"
                  title="ใช้หัวข้อเดิม"
                  onClick={() => draft.resetSectionTitle(section.id)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              value={note}
              onChange={(e) => draft.setSectionNote(section.id, e.target.value)}
              placeholder="หมายเหตุ"
              aria-label="หมายเหตุของหมวดนี้"
              className="h-7 w-44 border-dashed text-sm font-semibold text-red-700 dark:text-red-400"
            />
            {count > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {count}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1 px-4">
        {section.items.map((it) => (
          <ItemRow
            key={it.id}
            sectionId={section.id}
            item={it}
            editMode={editMode}
          />
        ))}

        {editMode ? (
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) addItem();
              }}
              placeholder="ชื่อเอกสารใหม่"
              className="h-8"
            />
            <Button size="sm" onClick={addItem} disabled={!newItem.trim()}>
              <Plus className="size-4" />
              เพิ่ม
            </Button>
          </div>
        ) : (
          <div className="border-t pt-3 mt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              คำถาม / ข้อมูลเพิ่มเติมในหมวดนี้
            </p>
            <QuestionList
              questions={standalone}
              placeholder="เช่น ปีเกิดของ…"
              addLabel="เพิ่มคำถาม"
              onAdd={() => draft.addSectionQuestion(section.id)}
              onChange={(i, v) => draft.updateSectionQuestion(section.id, i, v)}
              onRemove={(i) => draft.removeSectionQuestion(section.id, i)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
