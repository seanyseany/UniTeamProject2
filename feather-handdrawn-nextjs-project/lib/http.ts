import { NextResponse } from 'next/server';

export function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return badRequest('Authentication required.', 401);
    }

    if (error.message === 'FORBIDDEN') {
      return badRequest('You do not have permission for this action.', 403);
    }

    if (error.message === 'NOT_FOUND') {
      return badRequest('The requested resource was not found.', 404);
    }

    if (error.message === 'OWNER_CANNOT_LEAVE') {
      return badRequest('The group owner cannot leave their own group.', 400);
    }
  }

  return badRequest('Something went wrong. Please try again later.', 500);
}

export function cleanText(value: unknown, fieldName: string, maxLength: number) {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string.`);
  }

  const cleaned = value.trim();

  if (!cleaned) {
    throw new Error(`${fieldName} is required.`);
  }

  if (cleaned.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }

  return cleaned;
}

export function cleanOptionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error('Description must be a string.');
  }

  const cleaned = value.trim();

  if (cleaned.length > maxLength) {
    throw new Error(`Description must be ${maxLength} characters or fewer.`);
  }

  return cleaned;
}
