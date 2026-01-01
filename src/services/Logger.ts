import * as FileSystem from 'expo-file-system';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

class LoggerService {
    private static instance: LoggerService;
    private logDirectory: string;
    private logFile: string;
    private currentLevel: LogLevel = LogLevel.DEBUG; // Default to DEBUG for now

    private constructor() {
        this.logDirectory = FileSystem.documentDirectory + 'logs/';
        this.logFile = this.logDirectory + 'app.log';
        this.ensureDirectoryExists();
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    private async ensureDirectoryExists() {
        const dirInfo = await FileSystem.getInfoAsync(this.logDirectory);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(this.logDirectory, { intermediates: true });
        }
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private async writeToFile(level: string, message: string, data?: any) {
        const timestamp = this.getTimestamp();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        if (data) {
            if (typeof data === 'object') {
                try {
                    logMessage += `\n${JSON.stringify(data, null, 2)}`;
                } catch (e) {
                    logMessage += `\n[Circular or invalid object]`;
                }
            } else {
                logMessage += ` ${data}`;
            }
        }
        logMessage += '\n';

        // Console output
        switch (level) {
            case 'ERROR': console.error(logMessage); break;
            case 'WARN': console.warn(logMessage); break;
            default: console.log(logMessage); break;
        }

        // File output (append via read-write)
        // Note: writeAsStringAsync does not support 'append' in this version efficiently.
        // For robustness in this debugging phase, we will read-concat-write. 
        // In production logging, we would use a more efficient storage or native module.
        try {
            const currentContent = await this.getLogs();
            const newContent = (currentContent === 'No logs found.' ? '' : currentContent) + logMessage;

            await FileSystem.writeAsStringAsync(this.logFile, newContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });
        } catch (error) {
            console.error('Failed to write log to file:', error);
        }
    }

    public debug(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.DEBUG) this.writeToFile('DEBUG', message, data);
    }

    public info(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.INFO) this.writeToFile('INFO', message, data);
    }

    public warn(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.WARN) this.writeToFile('WARN', message, data);
    }

    public error(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.ERROR) this.writeToFile('ERROR', message, data);
    }

    public async getLogs(): Promise<string> {
        try {
            return await FileSystem.readAsStringAsync(this.logFile);
        } catch (error) {
            return 'No logs found.';
        }
    }

    public async clearLogs() {
        try {
            await FileSystem.deleteAsync(this.logFile, { idempotent: true });
            await this.ensureDirectoryExists(); // Recreate dir if deleted
            this.info('Logs cleared');
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
}

export const Logger = LoggerService.getInstance();
