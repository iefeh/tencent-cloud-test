interface Storage {
  save: <T>(key: string, val: T) => void;
  read: <T>(key: string) => T | null;
}
