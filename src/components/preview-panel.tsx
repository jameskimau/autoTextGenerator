"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyRichText } from "@/lib/clipboard";

type Props = { text: string; html: string };

export function PreviewPanel({ text, html }: Props) {
  const [copied, setCopied] = useState(false);
  const empty = !text.trim();

  const copy = async () => {
    try {
      await copyRichText(html, text);
      setCopied(true);
      toast.success("คัดลอกแล้ว — วางใน Gmail ได้เลย");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("คัดลอกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">ตัวอย่างข้อความ</h2>
        <Button onClick={copy} disabled={empty}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          <span>คัดลอกข้อความ</span>
        </Button>
      </div>
      <div className="min-h-40 flex-1 overflow-auto rounded-md border bg-background p-4 text-sm">
        {empty ? (
          <p className="text-muted-foreground">
            เลือกเอกสารหรือเพิ่มคำถามทางด้านซ้าย ข้อความจะแสดงที่นี่
          </p>
        ) : (
          <div
            className="preview-html"
            // Safe: every user string is escaped in generate().
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
