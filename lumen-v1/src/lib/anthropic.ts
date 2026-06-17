import Anthropic from "@anthropic-ai/sdk";

// Server-side only. The key lives in the environment, never in the browser —
// this is the security fix over the prototype, which called the API from the client.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODELS = {
  gen: process.env.LUMEN_GEN_MODEL ?? "claude-opus-4-8",
  critic: process.env.LUMEN_CRITIC_MODEL ?? "claude-sonnet-4-6",
} as const;

export async function callModel(model: string, system: string, user: string, maxTokens = 1200): Promise<string> {
  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

/** Strip code fences and parse the first JSON object/array in the text. */
export function parseJson<T = unknown>(text: string): T {
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{");
  const a = t.indexOf("[");
  const start = a !== -1 && (a < s || s === -1) ? a : s;
  const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  return JSON.parse(t) as T;
}
