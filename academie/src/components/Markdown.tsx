"use client";
// Minimale markdown-weergave voor AI-antwoorden (kopjes, lijsten, vet), met RTL voor Arabisch.
import { Fragment } from "react";
import { Rich } from "./arabic";

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>
            <Rich text={p.slice(2, -2)} />
          </strong>
        ) : (
          <Fragment key={i}>
            <Rich text={p.replace(/`/g, "")} />
          </Fragment>
        ),
      )}
    </>
  );
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={out.length} className="my-1 list-inside list-disc space-y-0.5">
          {list.map((l, i) => (
            <li key={i}>
              <Inline text={l} />
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const li = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (li) {
      list.push(li[1]);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) out.push(<p key={out.length} className="mt-2 font-semibold"><Inline text={h[1]} /></p>);
    else if (/^---+$/.test(line)) out.push(<hr key={out.length} className="my-2 border-line" />);
    else out.push(<p key={out.length} className="my-1"><Inline text={line} /></p>);
  }
  flush();
  return <div className="text-[15px] leading-relaxed">{out}</div>;
}
