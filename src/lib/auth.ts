import { NextRequest } from 'next/server';

export const GUEST_USER = {
  username: 'luperta_user',
  role: 'user' as const,
};

// Server-side auth info helper
export function getAuthInfoFromCookie(_request: NextRequest) {
  return {
    username: GUEST_USER.username,
    role: GUEST_USER.role,
  };
}

// Client-side auth info helper
export function getAuthInfoFromBrowserCookie(): {
  password?: string;
  username: string;
  signature?: string;
  timestamp?: number;
  role: 'owner' | 'admin' | 'user';
} {
  return {
    username: GUEST_USER.username,
    role: GUEST_USER.role,
  };
}
