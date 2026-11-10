"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { QuestionList } from "@/components/question-list";
import { fillTokens } from "@/lib/generate";
import type { CatalogItem } from "@/lib/types";
import { useCatalog } from "@/store/catalog-store";
import { useDraft } from "@/store/draft-store";

type Props = { sectionId: string; item: CatalogItem; editMode: boolean };

export function ItemRow({ sectionId, item, editMode }: Props) {
  const draft = useDraft();
  const { renameItem, removeItem, rememberQuestion, forgetQuestion } =
    useCatalog();
  const selected = draft.selected[item.id];
  const checkboxId = `item-${item.id}`;

  if (editMode) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={item.label}
          onChange={(e) => renameItem(sectionId, item.id, e.target.value)}
          className="h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-destructive"
          aria-label="ลบรายการ"
          onClick={() => {
            draft.toggleItem(item.id, false);
            removeItem(sectionId, item.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
  }

  const unused = item.savedQuestions.filter(
    (q) => !selected?.questions.includes(q),
  );

  return (
    <div
      className={
        selected
          ? "rounded-md border border-primary/30 bg-primary/5 p-2"
          : "rounded-md border border-transparent p-2 hover:bg-muted/50"
      }
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={checkboxId}
          checked={!!selected}
          onCheckedChange={(v) => draft.toggleItem(item.id, v === true)}
          className="mt-0.5"
        />
        <label
          htmlFor={checkboxId}
          className="flex-1 cursor-pointer text-sm leading-snug"
        >
          {fillTokens(item.label, draft)}
        </label>
      </div>

      {selected && (
        <div className="mt-2 space-y-2 pl-7">
          {unused.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unused.map((q) => (
                <span
                  key={q}
                  className="inline-flex items-center rounded-full border bg-background text-xs"
                >
                  <button
                    type="button"
                    className="py-1 pl-2.5 pr-1 hover:text-primary"
                    title="เพิ่มคำถามนี้"
                    onClick={() => draft.addItemQuestion(item.id, q)}
                  >
                    + {q}
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                    aria-label={`ลบ "${q}" ออกจากคำถามที่บันทึกไว้`}
                    onClick={() => forgetQuestion(item.id, q)}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <QuestionList
            questions={selected.questions}
            placeholder="พิมพ์คำถามเพิ่มเติม…"
            addLabel="คำถาม"
            onAdd={() => draft.addItemQuestion(item.id)}
            onChange={(i, v) => draft.updateItemQuestion(item.id, i, v)}
            onRemove={(i) => draft.removeItemQuestion(item.id, i)}
            onCommit={(v) => rememberQuestion(item.id, v)}
          />
        </div>
      )}
    </div>
  );
}
