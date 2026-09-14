import type { DefaultSession } from 'next-auth';

type UserRole = 'candidate' | 'employer' | 'instructor' | 'admin';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}
