"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Download,
  Eye,
  FilePlus2,
  Pencil,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PreviewPanel } from "@/components/preview-panel";
import { SectionCard } from "@/components/section-card";
import { generate } from "@/lib/generate";
import { isCatalog, useCatalog } from "@/store/catalog-store";
import { useDraft } from "@/store/draft-store";

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

export function GeneratorApp() {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div className="p-8 text-center text-muted-foreground">กำลังโหลด…</div>
    );
  }
  return <Generator />;
}

function Generator() {
  const catalog = useCatalog();
  const draft = useDraft();
  const [editMode, setEditMode] = useState(false);
  const [newSection, setNewSection] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { text, html } = useMemo(
    () => generate({ intro: catalog.intro, sections: catalog.sections }, draft),
    [catalog.intro, catalog.sections, draft],
  );

  const newRequest = () => {
    if (confirm("เริ่มคำขอใหม่? ชื่อ รายการที่เลือก และคำถามจะถูกล้าง")) {
      draft.reset(catalog.intro);
      toast("เริ่มคำขอใหม่แล้ว");
    }
  };

  const exportCatalog = () => {
    const blob = new Blob(
      [JSON.stringify({ intro: catalog.intro, sections: catalog.sections }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `document-list-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importCatalog = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isCatalog(data)) throw new Error("invalid");
      catalog.replaceCatalog(data);
      toast.success("นำเข้ารายการเอกสารแล้ว");
    } catch {
      toast.error("ไฟล์ไม่ถูกต้อง");
    }
  };

  const addSection = () => {
    const title = newSection.trim();
    if (!title) return;
    catalog.addSection(title);
    setNewSection("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">สร้างข้อความขอเอกสาร</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={newRequest}>
            <FilePlus2 className="size-4" />
            คำขอใหม่
          </Button>
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode((v) => !v)}
          >
            <Pencil className="size-4" />
            <span>{editMode ? "เสร็จสิ้น" : "แก้ไขรายการ"}</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <main className="space-y-4">
          <section className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="applicant">ชื่อผู้สมัคร (Applicant)</Label>
              <Input
                id="applicant"
                value={draft.applicantName}
                onChange={(e) => draft.setField("applicantName", e.target.value)}
                placeholder="เช่น ปาล์ม"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sponsor">ชื่อผู้สนับสนุน (Sponsor)</Label>
              <Input
                id="sponsor"
                value={draft.sponsorName}
                onChange={(e) => draft.setField("sponsorName", e.target.value)}
                placeholder="เช่น พี่ฝน"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="intro">ข้อความเปิด</Label>
              {editMode ? (
                <Textarea
                  id="intro"
                  value={catalog.intro}
                  onChange={(e) => catalog.setIntro(e.target.value)}
                  rows={2}
                  placeholder="ข้อความเปิดเริ่มต้นสำหรับทุกคำขอ"
                />
              ) : (
                <Textarea
                  id="intro"
                  value={draft.intro}
                  onChange={(e) => draft.setField("intro", e.target.value)}
                  rows={2}
                />
              )}
            </div>
          </section>

          {editMode && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-dashed p-3">
              <Button variant="outline" size="sm" onClick={exportCatalog}>
                <Download className="size-4" />
                ส่งออกรายการ (JSON)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" />
                นำเข้ารายการ
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importCatalog(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  if (
                    confirm(
                      "คืนค่ารายการเอกสารเริ่มต้น? รายการและคำถามที่บันทึกไว้จะหายไป",
                    )
                  ) {
                    catalog.resetToDefault();
                    draft.reset(useCatalog.getState().intro);
                  }
                }}
              >
                <RotateCcw className="size-4" />
                คืนค่าเริ่มต้น
              </Button>
            </div>
          )}

          {catalog.sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s}
              editMode={editMode}
              isFirst={i === 0}
              isLast={i === catalog.sections.length - 1}
            />
          ))}

          {editMode && (
            <div className="flex gap-2">
              <Input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) addSection();
                }}
                placeholder="ชื่อหมวดใหม่ เช่น เอกสารของลูก"
              />
              <Button onClick={addSection} disabled={!newSection.trim()}>
                <Plus className="size-4" />
                เพิ่มหมวด
              </Button>
            </div>
          )}
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)] rounded-xl border bg-card p-4">
            <PreviewPanel text={text} html={html} />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <Dialog>
          <DialogTrigger render={<Button className="w-full" />}>
            <Eye className="size-4" />
            ดูตัวอย่างและคัดลอก
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">ตัวอย่างข้อความ</DialogTitle>
            </DialogHeader>
            <div className="h-[70vh]">
              <PreviewPanel text={text} html={html} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
