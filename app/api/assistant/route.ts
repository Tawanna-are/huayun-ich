import { NextResponse } from "next/server";
import { parseAssistantRequest } from "@/lib/ai/assistant-request";
import { generateAssistantResponse } from "@/lib/ai/assistant-service";
import { captureAppException } from "@/lib/monitoring/sentry";
import { rateLimitRequest } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const rateLimited = rateLimitRequest(request, "api:assistant", 20);

  if (rateLimited) {
    return rateLimited;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseAssistantRequest(body);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const response = await generateAssistantResponse({
      messages: parsed.messages,
      question: parsed.question,
      locale: parsed.locale
    });

    return NextResponse.json(response);
  } catch (error) {
    captureAppException(error, {
      module: "api",
      operation: "assistant_route_post",
      tags: {
        locale: parsed.locale
      },
      extra: {
        question: parsed.question
      }
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assistant request failed." },
      { status: 503 }
    );
  }
}
