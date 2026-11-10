import type { OutputEntry, OutputSection } from "@/lib/generate";

type Props = { title: string; sections: OutputSection[] };

/**
 * Printable A4 questionnaire the client fills in by hand.
 * Uses fixed black/gray colours (not theme tokens) so it prints the same in dark mode.
 */
export function Questionnaire({ title, sections }: Props) {
  const today = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Print layout: @page has no margin (so Chrome prints no header/footer), and
  // the empty <thead>/<tfoot> rows repeat on every printed page as top/bottom
  // margins.
  return (
    <table className="questionnaire w-full border-collapse bg-white text-[13px] leading-relaxed text-black">
      <thead>
        <tr>
          <td className="h-[16mm] p-0" />
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td className="h-[16mm] p-0" />
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td className="px-[14mm] py-0 align-top">
            <article>
              <header className="mb-6 border-b-2 border-black pb-3">
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="mt-1 text-xs text-gray-600">
                  วันที่ออกเอกสาร {today}
                </p>
                <p className="mt-2 text-xs text-gray-700">
                  กรุณากรอกข้อมูลให้ครบถ้วน แล้วถ่ายรูปหรือสแกนส่งกลับทางอีเมล
                </p>
              </header>

              {sections.map((s, si) => (
                <section key={si} className="mb-6">
                  <h2 className="q-keep mb-2 border-b border-gray-300 pb-1 text-[15px] font-bold">
                    {s.title}
                    {s.note && (
                      <span className="ml-2 font-bold text-[#c00000]">
                        {s.note}
                      </span>
                    )}
                  </h2>
                  <ol className="space-y-3">
                    {s.entries.map((e, ei) => (
                      <Entry key={ei} entry={e} mode={s.pdfMode} />
                    ))}
                  </ol>
                </section>
              ))}
            </article>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Entry({
  entry,
  mode,
}: {
  entry: OutputEntry;
  mode: OutputSection["pdfMode"];
}) {
  const tick = entry.kind === "item" && mode === "checklist";
  return (
    <li className="q-keep">
      <div className="flex items-start gap-2">
        {tick ? (
          <span
            aria-hidden
            className="mt-[3px] inline-block size-3.5 shrink-0 border border-black"
          />
        ) : (
          <span aria-hidden className="shrink-0 font-bold">
            •
          </span>
        )}
        <span className="font-medium">{entry.label}</span>
      </div>
      {!tick && <AnswerLines count={2} />}
      {entry.questions.length > 0 && (
        <ul className="mt-1.5 space-y-2 pl-6">
          {entry.questions.map((q, qi) => (
            <li key={qi} className="q-keep">
              <span className="text-gray-800">– {q}</span>
              <AnswerLines count={2} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function AnswerLines({ count }: { count: number }) {
  return (
    <div aria-hidden className="pl-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-7 border-b border-dotted border-gray-500" />
      ))}
    </div>
  );
}
