import { EventEmitter } from 'events';

export interface Command {
  type: string;
  payload?: any;
}

class CommandsService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  executeCommand(command: Command): void {
    try {
      console.log(`Executing command: ${command.type}`);
      this.eventEmitter.emit('command', command);
    } catch (error) {
      console.error(`Error executing command ${command.type}:`, error);
    }
  }

  onCommand(listener: (command: Command) => void): void {
    this.eventEmitter.on('command', (command: Command) => {
      try {
        listener(command);
      } catch (error) {
        console.error(`Error handling command ${command.type}:`, error);
      }
    });
  }
}

export const commandsService = new CommandsService();
