/**
 * UDANPATH Reusable Frontend Gemini AI Client
 * Connects to live FastAPI streaming endpoint (/api/v1/ai/chat) for real-time Gemini AI output.
 */

class GeminiFrontendClient {
  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Verifies AI service health via backend endpoint.
   */
  async verifyConnection() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/ai/verify`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Gemini Client] Verification check failed:", err);
    }
    return { status: "offline", connected: false };
  }

  /**
   * Streams chat completion response from Gemini AI.
   * @param {string} message - User query message
   * @param {string} contextExam - Active exam context filter
   * @param {function} onToken - Callback for streaming tokens
   * @param {function} onComplete - Callback when stream finishes
   * @param {function} onError - Callback on error
   */
  async streamChat(message, contextExam = "ALL", onToken, onComplete, onError) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context_exam: contextExam })
      });

      if (!response.ok) {
        if (onError) onError(`Server returned status ${response.status}`);
        return false;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              if (onComplete) onComplete(accumulatedText);
              return true;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                accumulatedText += parsed.token;
                if (onToken) onToken(parsed.token, accumulatedText);
              }
            } catch (e) {}
          }
        }
      }

      if (onComplete) onComplete(accumulatedText);
      return true;
    } catch (err) {
      if (onError) onError(err);
      return false;
    }
  }
}

window.UdanPathGemini = new GeminiFrontendClient();
