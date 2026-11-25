import { isAxiosError } from 'axios';

const CONNECTION_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Tente novamente.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getResponseMessage(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  const { message } = data;

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );

    return messages.length > 0 ? messages.map((item) => item.trim()).join('\n') : null;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!isAxiosError<unknown>(error)) {
    return fallbackMessage;
  }

  const responseMessage = getResponseMessage(error.response?.data);

  if (responseMessage) {
    return responseMessage;
  }

  return error.response ? fallbackMessage : CONNECTION_ERROR_MESSAGE;
}
