import type { ReactNode } from "react";

/** Match http(s) URLs; stop before whitespace or common trailing punctuation. */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

function trimTrailingPunctuation(raw: string): { url: string; trailing: string } {
  let url = raw;
  let trailing = "";
  while (url.length > 0 && /[.,;:!?)]$/.test(url)) {
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

/** True when the string is a navigable http(s) URL (no `[placeholder]` tokens). */
export function isNavigableHttpUrl(value: string): boolean {
  if (value.includes("[")) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const linkClassName =
  "break-all text-accent underline-offset-2 hover:underline";

/** Render plain text with navigable http(s) URLs as `<a href>`. */
export function linkifyText(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(URL_PATTERN.source, "g");

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const { url, trailing } = trimTrailingPunctuation(match[0]);
    if (isNavigableHttpUrl(url)) {
      nodes.push(
        <a
          key={`${url}-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {url}
        </a>,
      );
    } else {
      nodes.push(url);
    }
    if (trailing) nodes.push(trailing);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}

type InstallGuideUrlProps = {
  url: string;
  className?: string;
};

/** Guide URL as a real link when navigable; otherwise plain `<code>`. */
export function InstallGuideUrl({ url, className }: InstallGuideUrlProps) {
  const plain =
    className ?? "mt-2 block break-all text-xs text-accent";
  const link =
    className ??
    "mt-2 block break-all text-xs text-accent underline-offset-2 hover:underline";

  if (isNavigableHttpUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={link}
      >
        <code className="text-inherit">{url}</code>
      </a>
    );
  }

  return <code className={plain}>{url}</code>;
}
