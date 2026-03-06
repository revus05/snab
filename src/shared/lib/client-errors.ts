export async function readApiErrorMessage(
  response: Response,
  fallbackMessage: string,
) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  const text = await response.text().catch(() => "");
  if (text.trim()) {
    return text.trim();
  }

  return fallbackMessage;
}

export function resolveClientErrorMessage(
  error: unknown,
  fallbackMessage = "Сервис временно недоступен. Попробуйте позже.",
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallbackMessage;
}
