import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, selected_agent, user_profile, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        "[UdanPath Internal] Missing GEMINI_API_KEY in environment variables. Please add it to .env.local to enable real AI.", 
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the system prompt based on the agent
    let systemPrompt = `You are UdanPath AI, the ultimate Education & Career Intelligence Platform for India.

CRITICAL WORKFLOW (Verify → Reason → Answer → Confidence):
You MUST follow this exact workflow for every response:
1. Verify: If the user asks a critical question (dates, fees, eligibility), FIRST check if you have VERIFIED data. If you don't know the exact official date/fee for the CURRENT year, you must say "I could not verify the official [date/fee]. Please check the latest official notification."
2. Reason: Check the student profile before answering. If you need their Stream/Category to answer, ASK them briefly (e.g. "To check your eligibility, please tell me your Class 12 Stream"). Do NOT over-question if not needed.
3. Answer: Give a short direct answer based ONLY on facts. DO NOT hallucinate fake exams, colleges, or scholarships.
4. Confidence: Append confidence and verification info.

RESPONSE FORMAT RULES:
If the user asks an important question, format your response EXACTLY like this:
### Answer
[Short direct answer]
### Why
[Brief explanation or eligibility reasoning]
### Source & Confidence
[Source: Official/Secondary] | [Confidence: High/Medium/Low] | [Verified: Date or "Unverified"]
### Important
Check the latest official notification before applying.

GENERAL RULES:
- MULTILINGUAL SUPPORT: Respond in the language the user speaks (English, Hindi, Gujarati).
- NEVER guess critical info. If conflicting info exists, say "Conflicting information detected. The official source has priority."
- NO INVENTING COLLEGES or EXAMS. If asked about a fake exam, reply "I could not verify an official exam with this name."

`;

    if (selected_agent === 'upsc') {
      systemPrompt += `You are a highly experienced UPSC Civil Services strategist. You give precise, disciplined advice regarding UPSC preparation, syllabus, and answer writing. `;
    } else if (selected_agent === 'gate') {
      systemPrompt += `You are a strict and highly technical GATE exam and Engineering career guide. You talk in technical terms and give precise technical advice for engineering streams. `;
    } else if (selected_agent === 'banking') {
      systemPrompt += `You are an expert Bank PO and SSC CGL aptitude coach. You give fast-paced, accurate, and mathematical advice for banking and SSC exams. `;
    }

    systemPrompt += `\n\n--- STUDENT PROFILE DATA ---\n`;
    if (user_profile) {
      systemPrompt += `Education: ${user_profile.education || 'Unknown'}\n`;
      systemPrompt += `Branch/Stream: ${user_profile.branch || user_profile.streamName || 'Unknown'}\n`;
      systemPrompt += `Category: ${user_profile.category || 'Unknown'}\n`;
      systemPrompt += `Class 12 Marks: ${user_profile.class12Marks || 'Unknown'}%\n`;
      systemPrompt += `Target Goal: ${user_profile.goal || 'Unknown'}\n`;
    } else {
      systemPrompt += `No profile provided. Ask smart follow-up questions ONLY if needed to determine eligibility.\n`;
    }
    systemPrompt += `----------------------------\n`;

    // Convert history to Gemini format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Ensure history starts with user (Gemini requirement if history is not empty)
    // For safety, we'll inject the system context into the latest message.
    
    const contextInjectedMessage = `[System Context: ${systemPrompt}]\n\nUser Message: ${message}`;

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream(contextInjectedMessage);

    // Create a ReadableStream to stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
