declare module "jsdom" {
  export class JSDOM {
    constructor(
      markup?: string,
      options?: {
        contentType?: string;
      },
    );

    window: Window & typeof globalThis;
  }
}
