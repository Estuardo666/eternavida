export class MediaLibraryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaLibraryNotFoundError";
  }
}

export class MediaLibraryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaLibraryConflictError";
  }
}
