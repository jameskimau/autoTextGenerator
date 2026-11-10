"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  questions: string[];
  placeholder: string;
  addLabel: string;
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onCommit?: (value: string) => void;
};

export function QuestionList({
  questions,
  placeholder,
  addLabel,
  onAdd,
  onChange,
  onRemove,
  onCommit,
}: Props) {
  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={i} className="flex items-center gap-2">
          <span aria-hidden className="text-muted-foreground">
            –
          </span>
          <Input
            autoFocus={q === "" && i === questions.length - 1}
            value={q}
            placeholder={placeholder}
            onChange={(e) => onChange(i, e.target.value)}
            onBlur={(e) => onCommit?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                onAdd();
              }
            }}
            className="h-8"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="ลบคำถาม"
            onClick={() => onRemove(i)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7"
        onClick={onAdd}
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
