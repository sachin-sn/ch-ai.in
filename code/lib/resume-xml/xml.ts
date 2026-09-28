// Minimal, dependency-free XML builder. Enough for two static documents —
// not a general-purpose serializer.

export type XmlNode = {
  name: string;
  attrs?: Record<string, string | number | boolean | undefined>;
  children?: (XmlNode | string | null | undefined | false)[];
};

const escapeText = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (s: string) => escapeText(s).replace(/"/g, "&quot;");

/** Element shorthand: el("Title", "Engineer"), el("Skills", {}, [..]) */
export function el(
  name: string,
  attrsOrText?: XmlNode["attrs"] | string | number,
  children?: XmlNode["children"],
): XmlNode {
  if (typeof attrsOrText === "string" || typeof attrsOrText === "number") {
    return { name, children: [String(attrsOrText)] };
  }
  return { name, attrs: attrsOrText, children };
}

function render(node: XmlNode, depth: number): string {
  const pad = "  ".repeat(depth);
  const attrs = Object.entries(node.attrs ?? {})
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => ` ${k}="${escapeAttr(String(v))}"`)
    .join("");
  const kids = (node.children ?? []).filter(
    (c): c is XmlNode | string => c !== null && c !== undefined && c !== false,
  );
  if (kids.length === 0) return `${pad}<${node.name}${attrs}/>`;
  if (kids.length === 1 && typeof kids[0] === "string") {
    return `${pad}<${node.name}${attrs}>${escapeText(kids[0])}</${node.name}>`;
  }
  const inner = kids
    .map((k) => (typeof k === "string" ? `${pad}  ${escapeText(k)}` : render(k, depth + 1)))
    .join("\n");
  return `${pad}<${node.name}${attrs}>\n${inner}\n${pad}</${node.name}>`;
}

export function toXmlDocument(root: XmlNode, comment?: string): string {
  const head = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  // "--" is illegal inside an XML comment.
  const c = comment ? `<!--\n${comment.replace(/--/g, "- -")}\n-->\n` : "";
  return `${head}${c}${render(root, 0)}\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
