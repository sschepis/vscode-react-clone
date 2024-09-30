export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SettingsSaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsSaveError';
  }
}

export class SettingsLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsLoadError';
  }
}