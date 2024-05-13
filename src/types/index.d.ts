declare class InformableError {
  code: string | number;
  message: string;
}

declare interface Window {
  InformableError: typeof InformableError;
}
