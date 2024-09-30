import * as os from 'os';
import { EventEmitter } from 'events';

interface ResourceMonitorOptions {
    interval?: number;
    highLoadThreshold?: number;
    highMemoryThreshold?: number;
    normalLoadThreshold?: number;
    normalMemoryThreshold?: number;
    highLoadCooldown?: number;
    historyLength?: number;
}

interface ResourceInfo {
    timestamp: number;
    load: number;
    memoryUsage: number;
}

export class ResourceMonitor extends EventEmitter {
    private interval: number;
    private highLoadThreshold: number;
    private highMemoryThreshold: number;
    private normalLoadThreshold: number;
    private normalMemoryThreshold: number;
    private lastHighLoadTime: number;
    private highLoadCooldown: number;
    private monitorInterval: NodeJS.Timeout | null;
    private resourceHistory: ResourceInfo[];
    private historyLength: number;

    constructor(options: ResourceMonitorOptions = {}) {
        super();
        this.interval = options.interval || 5000;
        this.highLoadThreshold = options.highLoadThreshold || 0.8;
        this.highMemoryThreshold = options.highMemoryThreshold || 0.9;
        this.normalLoadThreshold = options.normalLoadThreshold || 0.5;
        this.normalMemoryThreshold = options.normalMemoryThreshold || 0.7;
        this.lastHighLoadTime = 0;
        this.highLoadCooldown = options.highLoadCooldown || 60000;
        this.monitorInterval = null;
        this.resourceHistory = [];
        this.historyLength = options.historyLength || 60;
    }

    start(): void {
        if (this.monitorInterval) {
            console.warn('Resource monitor is already running');
            return;
        }
        this.monitorInterval = setInterval(() => this.monitor(), this.interval);
        console.log('Resource monitor started');
    }

    stop(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('Resource monitor stopped');
        }
    }

    private monitor(): void {
        const currentTime = Date.now();
        const load = os.loadavg()[0];
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = (totalMemory - freeMemory) / totalMemory;

        const resourceInfo: ResourceInfo = { timestamp: currentTime, load, memoryUsage };
        this.resourceHistory.push(resourceInfo);
        if (this.resourceHistory.length > this.historyLength) {
            this.resourceHistory.shift();
        }

        if ((load > this.highLoadThreshold || memoryUsage > this.highMemoryThreshold) && 
            (currentTime - this.lastHighLoadTime > this.highLoadCooldown)) {
            this.emit('highLoad', { load, memoryUsage });
            this.lastHighLoadTime = currentTime;
        } else if (load < this.normalLoadThreshold && memoryUsage < this.normalMemoryThreshold) {
            this.emit('normalLoad', { load, memoryUsage });
        }
    }

    getResourceSummary() {
        if (this.resourceHistory.length === 0) {
            return null;
        }

        const latestInfo = this.resourceHistory[this.resourceHistory.length - 1];
        const avgLoad = this.resourceHistory.reduce((sum, info) => sum + info.load, 0) / this.resourceHistory.length;
        const avgMemoryUsage = this.resourceHistory.reduce((sum, info) => sum + info.memoryUsage, 0) / this.resourceHistory.length;
        const maxLoad = Math.max(...this.resourceHistory.map(info => info.load));
        const maxMemoryUsage = Math.max(...this.resourceHistory.map(info => info.memoryUsage));

        return {
            current: {
                load: latestInfo.load,
                memoryUsage: latestInfo.memoryUsage
            },
            average: {
                load: avgLoad,
                memoryUsage: avgMemoryUsage
            },
            max: {
                load: maxLoad,
                memoryUsage: maxMemoryUsage
            },
            timeRange: {
                start: this.resourceHistory[0].timestamp,
                end: latestInfo.timestamp
            }
        };
    }
}