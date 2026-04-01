/// <reference types="@cloudflare/workers-types" />

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
    exec<T = unknown>(query: string): Promise<T>;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run<T = unknown>(): Promise<T>;
    all<T = unknown>(): Promise<T[]>;
    raw<T = unknown>(): Promise<T[]>;
  }

  interface Env {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    REMOVE_BG_API_KEY: string;
    NEXTAUTH_SECRET: string;
  }
}

export {};
