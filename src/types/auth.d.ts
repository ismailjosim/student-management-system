import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'admin' | 'coordinator' | 'viewer';
  }

  interface Session {
    user: User & {
      email: string;
      name: string;
      role: 'admin' | 'coordinator' | 'viewer';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'coordinator' | 'viewer';
  }
}
