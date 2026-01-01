import { deleteAsync, documentDirectory, getInfoAsync, makeDirectoryAsync, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';

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
        this.logDirectory = (documentDirectory || '') + 'logs/';
        this.logFile = this.logDirectory + 'app.log';
        this.ensureDirectoryExists().catch(err => {
            console.error('Logger initialization failed to ensure directory:', err);
        });
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    private async ensureDirectoryExists() {
        const dirInfo = await getInfoAsync(this.logDirectory);
        if (!dirInfo.exists) {
            await makeDirectoryAsync(this.logDirectory, { intermediates: true });
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

        // File output
        try {
            // Note: In RN, writeAsStringAsync over-writes. 
            // We use read-concat-write for now as a simple solution.
            // Wrap in a try-catch to ensure any background failure is logged to console and doesn't crash.
            const currentContent = await this.getLogs().catch(() => '');
            const newContent = (currentContent === 'No logs found.' ? '' : currentContent) + logMessage;

            await writeAsStringAsync(this.logFile, newContent, {
                encoding: 'utf8',
            });
        } catch (error) {
            // Log to console only if file write fails, to avoid unhandled rejections
            console.error('CRITICAL: Failed to write log to file system:', error);
        }
    }

    public debug(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            this.writeToFile('DEBUG', message, data).catch(err => {
                console.error('Unhandled rejection in Logger.debug write:', err);
            });
        }
    }

    public info(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.INFO) {
            this.writeToFile('INFO', message, data).catch(err => {
                console.error('Unhandled rejection in Logger.info write:', err);
            });
        }
    }

    public warn(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.WARN) {
            this.writeToFile('WARN', message, data).catch(err => {
                console.error('Unhandled rejection in Logger.warn write:', err);
            });
        }
    }

    public error(message: string, data?: any) {
        if (this.currentLevel <= LogLevel.ERROR) {
            this.writeToFile('ERROR', message, data).catch(err => {
                console.error('Unhandled rejection in Logger.error write:', err);
            });
        }
    }

    public async getLogs(): Promise<string> {
        try {
            return await readAsStringAsync(this.logFile);
        } catch (error) {
            return 'No logs found.';
        }
    }

    public async clearLogs() {
        try {
            await deleteAsync(this.logFile, { idempotent: true });
            await this.ensureDirectoryExists(); // Recreate dir if deleted
            this.info('Logs cleared');
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
}

export const Logger = LoggerService.getInstance();
