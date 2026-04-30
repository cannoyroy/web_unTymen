interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_BASE_URL?: string;
}

interface RequestContext {
  env: Env;
  request: Request;
}

type ChatRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequest {
  messages?: ChatMessage[];
  threadId?: string;
  stream?: boolean;
}

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4000;

const SYSTEM_PROMPT =
  "You are a concise and pragmatic technical assistant. Give accurate, actionable answers with clear steps.";

const jsonResponse = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const sanitizeMessages = (rawMessages: ChatMessage[] = []): ChatMessage[] =>
  rawMessages
    .filter((message) => {
      if (!message) return false;
      if (!["system", "user", "assistant"].includes(message.role)) return false;
      return typeof message.content === "string" && message.content.trim().length > 0;
    })
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }));

const extractText = (content: unknown): string =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content
          .map((part) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
              const textValue = (part as { text?: unknown }).text;
              return typeof textValue === "string" ? textValue : "";
            }
            return "";
          })
          .join("")
      : "";

const extractChoicesText = (payload: unknown): string => {
  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";
  return extractText(choices[0]?.message?.content);
};

const extractDeltaText = (payload: unknown): string => {
  const choices = (payload as { choices?: Array<{ delta?: { content?: unknown } }> })?.choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";
  return extractText(choices[0]?.delta?.content);
};

const toOpenAIMessages = (messages: ChatMessage[]) => [
  { role: "system", content: SYSTEM_PROMPT },
  ...messages.map((message) => ({ role: message.role, content: message.content })),
];

const getCompletionsUrl = (baseUrl?: string): string => {
  const normalized = (baseUrl || DEFAULT_OPENAI_BASE_URL).trim().replace(/\/+$/, "");
  return `${normalized}/chat/completions`;
};

const readOpenAIError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    return payload?.error?.message || payload?.message || `OpenAI request failed (${response.status})`;
  } catch {
    return `OpenAI request failed (${response.status})`;
  }
};

const completeChat = async (
  env: Env,
  messages: ChatMessage[],
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> => {
  const response = await fetch(getCompletionsUrl(env.OPENAI_BASE_URL), {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: toOpenAIMessages(messages),
      stream: false,
    }),
  });

  if (!response.ok) {
    return { ok: false, status: response.status, error: await readOpenAIError(response) };
  }

  const payload = await response.json();
  return { ok: true, text: extractChoicesText(payload) };
};

const streamChat = async (
  env: Env,
  messages: ChatMessage[],
): Promise<Response> => {
  const openAIResponse = await fetch(getCompletionsUrl(env.OPENAI_BASE_URL), {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: toOpenAIMessages(messages),
      stream: true,
    }),
  });

  if (!openAIResponse.ok) {
    return jsonResponse(openAIResponse.status, { error: await readOpenAIError(openAIResponse) });
  }

  if (!openAIResponse.body) {
    return jsonResponse(502, { error: "OpenAI stream is unavailable." });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = openAIResponse.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          buffer += decoder.decode(value, { stream: true });
          let markerIndex = buffer.indexOf("\n\n");

          while (markerIndex !== -1) {
            const rawEvent = buffer.slice(0, markerIndex);
            buffer = buffer.slice(markerIndex + 2);

            const lines = rawEvent.split("\n");
            const dataLines = lines
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());

            for (const dataLine of dataLines) {
              if (!dataLine) continue;
              if (dataLine === "[DONE]") {
                sendEvent("done", { ok: true });
                controller.close();
                return;
              }

              try {
                const payload = JSON.parse(dataLine);
                const text = extractDeltaText(payload);
                if (text) sendEvent("token", { text });
              } catch {
                // Ignore malformed chunk and continue parsing stream.
              }
            }

            markerIndex = buffer.indexOf("\n\n");
          }
        }

        sendEvent("done", { ok: true });
        controller.close();
      } catch {
        sendEvent("error", { message: "Failed to stream assistant response." });
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
};

const parseQueryMessages = (request: Request): ChatMessage[] => {
  const url = new URL(request.url);
  let question = (url.searchParams.get("q") || request.headers.get("x-ai-question") || "").trim();
  const rawHistory = url.searchParams.get("h") || request.headers.get("x-ai-history") || "";
  let history: ChatMessage[] = [];

  if (rawHistory) {
    try {
      const parsed = JSON.parse(rawHistory) as ChatMessage[];
      history = sanitizeMessages(parsed);
    } catch {
      history = [];
    }
  }

  if (!question) {
    const lastUser = [...history].reverse().find((message) => message.role === "user");
    question = lastUser?.content?.trim() || "";
  }

  if (!question) return history;
  const shouldAppend =
    history.length === 0 ||
    history[history.length - 1].role !== "user" ||
    history[history.length - 1].content !== question;
  return sanitizeMessages(shouldAppend ? [...history, { role: "user", content: question }] : history);
};

export const onRequestPost = async ({ env, request }: RequestContext): Promise<Response> => {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(500, { error: "OPENAI_API_KEY is missing on server." });
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    return jsonResponse(400, { error: "Request body is empty." });
  }

  let body: ChatRequest;
  try {
    body = JSON.parse(rawBody) as ChatRequest;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload." });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages.length) {
    return jsonResponse(400, { error: "messages is required and cannot be empty." });
  }

  if (!body.stream) {
    try {
      const result = await completeChat(env, messages);
      if (!result.ok) return jsonResponse(result.status, { error: result.error });
      return jsonResponse(200, { text: result.text });
    } catch {
      return jsonResponse(500, { error: "Failed to generate assistant response." });
    }
  }

  try {
    return await streamChat(env, messages);
  } catch {
    return jsonResponse(500, { error: "Failed to stream assistant response." });
  }
};

export const onRequestGet = async ({ env, request }: RequestContext): Promise<Response> => {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(500, { error: "OPENAI_API_KEY is missing on server." });
  }

  const messages = parseQueryMessages(request);
  if (!messages.length) {
    return jsonResponse(400, { error: "Missing question/messages in request." });
  }

  try {
    const result = await completeChat(env, messages);
    if (!result.ok) return jsonResponse(result.status, { error: result.error });
    return jsonResponse(200, { text: result.text });
  } catch {
    return jsonResponse(500, { error: "Failed to generate assistant response." });
  }
};
