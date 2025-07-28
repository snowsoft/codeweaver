export {};

declare global {
  interface Window {
    api: {
      weaver: {
        execute: (command: string, args: string[]) => Promise<any>;
      };
      file: {
        read: (path: string) => Promise<string>;
        write: (path: string, content: string) => Promise<void>;
        open: (path: string) => Promise<void>;
      };
      project: {
        open: () => Promise<string | null>;
      };
    };
  }
}