import { Fragment, type ReactNode } from "react";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; text: string };

function normalizeMarkdown(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .replace(/\*{3}([^*\n]+)\*{3}/g, "**$1**")
    .replace(/\*{3}([^*\n]+)\*{2}(?!\*)/g, "**$1**")
    .replace(/(?<!\*)\*{2}([^*\n]+)\*{3}/g, "**$1**");
}

function cleanPlainText(value: string) {
  return value
    .replace(/\*{2,3}/g, "")
    .replace(/_{2,3}/g, "");
}

function inlineMarkdown(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\x60[^\x60\n]+\x60)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      const plain = cleanPlainText(value.slice(lastIndex, match.index));
      if (plain) {
        nodes.push(<Fragment key={"text-" + key++}>{plain}</Fragment>);
      }
    }

    const token = match[0];
    if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      nodes.push(
        <strong key={"strong-" + key++} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={"code-" + key++}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < value.length) {
    const plain = cleanPlainText(value.slice(lastIndex));
    if (plain) {
      nodes.push(<Fragment key={"text-" + key++}>{plain}</Fragment>);
    }
  }

  return nodes;
}

function parseBlocks(rawContent: string): Block[] {
  const content = normalizeMarkdown(rawContent);
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let index = 0;

  const pushParagraph = (parts: string[]) => {
    const text = parts.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
  };

  while (index < lines.length) {
    const line = (lines[index] ?? "").trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("\x60\x60\x60")) {
      const code: string[] = [];
      index += 1;
      while (
        index < lines.length &&
        !(lines[index] ?? "").trim().startsWith("\x60\x60\x60")
      ) {
        code.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s*(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: cleanPlainText(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    if (/^[-+*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = (lines[index] ?? "").trim();
        const item = current.match(/^[-+*]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ type: "unordered", items });
      continue;
    }

    if (/^\d+[.)]\s*/.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = (lines[index] ?? "").trim();
        const item = current.match(/^\d+[.)]\s*(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
      }
      blocks.push({ type: "ordered", items });
      continue;
    }

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (index < lines.length) {
        const current = (lines[index] ?? "").trim();
        if (!current.startsWith(">")) break;
        parts.push(current.replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: parts.join(" ") });
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = (lines[index] ?? "").trim();
      if (
        !next ||
        next.startsWith("\x60\x60\x60") ||
        /^(#{1,4})\s*/.test(next) ||
        /^[-+*]\s+/.test(next) ||
        /^\d+[.)]\s*/.test(next) ||
        next.startsWith(">")
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    pushParagraph(paragraph);
  }

  return blocks;
}

export function NexusMarkdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2.5 break-words">
      {blocks.map((block, index) => {
        const key = block.type + "-" + index;

        if (block.type === "heading") {
          const className =
            block.level <= 2
              ? "font-display text-base font-bold leading-6 text-foreground"
              : "font-display text-sm font-bold leading-5 text-foreground";
          return (
            <p key={key} className={className}>
              {inlineMarkdown(block.text)}
            </p>
          );
        }

        if (block.type === "unordered") {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={key + "-" + itemIndex}>{inlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol key={key} className="list-decimal space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={key + "-" + itemIndex}>{inlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="border-l-2 border-gold/35 pl-3 text-muted-foreground"
            >
              {inlineMarkdown(block.text)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={key}
              className="overflow-x-auto rounded-xl border border-border bg-background/70 p-3 font-mono text-xs leading-5 text-foreground"
            >
              <code>{block.text}</code>
            </pre>
          );
        }

        return (
          <p key={key} className="whitespace-normal">
            {inlineMarkdown(block.text)}
          </p>
        );
      })}
    </div>
  );
}
