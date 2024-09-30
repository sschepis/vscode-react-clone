export function jsonrepair(json: string): string {
    // This is a simple implementation. For a more robust solution,
    // consider using a library like 'json-repair' or implementing a full JSON repair algorithm.
    try {
        JSON.parse(json);
        return json;
    } catch (e) {
        // Basic repair: remove trailing commas, add missing quotes to keys
        const repaired = json
            .replace(/,\s*([\]}])/g, '$1')
            .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
        try {
            JSON.parse(repaired);
            return repaired;
        } catch (e) {
            throw new Error('Unable to repair JSON');
        }
    }
}

export async function execPromise(command: string): Promise<string> {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec(command, (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}