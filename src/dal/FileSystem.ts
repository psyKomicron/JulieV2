import fs = require('fs');
import { IStreamOptions } from './IStreamOptions';

export class FileSystem
{
    public static readFile(path: string): Buffer
    {
        return fs.readFileSync(path);
    }

    public static appendToFile(path: string, content: string): void
    {
        fs.appendFileSync(path, content);
    }

    public static writeFile(path: string, content: string): void
    {
        fs.writeFileSync(path, content);
    }

    public static exists(path: string): boolean
    {
        return fs.existsSync(path);
    }

    public static mkdir(path: string, recursive = false): string
    {
        return fs.mkdirSync(path, { recursive: recursive });
    }

    public static rmdir(path: string): void
    {
        fs.rmdirSync(path);
    }

    public static unlink(path: string): void
    {
        fs.unlinkSync(path);
    }

    public static getStats(path: string): fs.Stats
    {
        return fs.statSync(path);
    }

    public static createReadStream(path: string, opt: string | IStreamOptions): fs.ReadStream
    {
        return fs.createReadStream(path, opt);
    }

    public static createWriteStream(path: string, opt: IStreamOptions | string): fs.WriteStream
    {
        return fs.createWriteStream(path, opt);
    }
}