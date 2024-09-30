export class BuildStatusService {
  private statusListeners: ((status: string) => void)[] = [];

  updateStatus(status: string): void {
    console.log(`Build Status: ${status}`);
    this.notifyListeners(status);
  }

  addStatusListener(listener: (status: string) => void): void {
    this.statusListeners.push(listener);
  }

  removeStatusListener(listener: (status: string) => void): void {
    const index = this.statusListeners.indexOf(listener);
    if (index !== -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  private notifyListeners(status: string): void {
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}