export type CodeTokenType =
  | "kw"
  | "type"
  | "ident"
  | "str"
  | "num"
  | "comment"
  | "punct"
  | "plain";

export interface CodeToken {
  type: CodeTokenType;
  value: string;
}

const KEYWORDS = new Set([
  "package",
  "type",
  "struct",
  "var",
  "func",
  "return",
  "map",
  "string",
  "int",
  "float64",
  "bool",
]);

const PUNCT_SET = new Set(["[", "]", "{", "}", "(", ")", ",", ":", "="]);

const TOKEN_RE =
  /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b|[\[\]{}(),:=]|\s+|.)/g;

export const tokenizeCodeLine = (line: string): CodeToken[] => {
  const tokens = line.match(TOKEN_RE) ?? [];
  return tokens.map((value) => {
    if (/^\/\/.*$/.test(value)) return { type: "comment", value };
    if (/^"(?:[^"\\]|\\.)*"$/.test(value) || /^'(?:[^'\\]|\\.)*'$/.test(value)) {
      return { type: "str", value };
    }
    if (/^\s+$/.test(value)) return { type: "plain", value };
    if (/^\d+(?:\.\d+)?$/.test(value)) return { type: "num", value };
    if (PUNCT_SET.has(value)) return { type: "punct", value };
    if (KEYWORDS.has(value)) return { type: "kw", value };
    if (/^[A-Z][A-Za-z0-9_]*$/.test(value)) return { type: "type", value };
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) return { type: "ident", value };
    return { type: "plain", value };
  });
};
