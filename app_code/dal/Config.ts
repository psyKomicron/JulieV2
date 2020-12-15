import { FileSystem as fs } from './FileSystem';
import { ConfigurationError } from '../errors/dal_errors/ConfigurationError';
import { JSONParser } from '../helpers/JSONParser';
import { EventEmitter } from 'events';

export class Config //extends EventEmitter
{
    private static readonly path = "./config/config.json";
    private static prefix: string;
    private static startDirectories: Array<string> = new Array();
    private static authorizedUsers: Array<string> = new Array();
    private static verbose: number;

    public static init()
    {
        let config = JSON.parse(fs.readFile("./config/config.json").toString());
        const template = { "prefix": "", "authorizedusers": [""], "verbose": 1, "startdirectories": [""] };
        if (fs.exists("./config/config.json") && JSONParser.matchTemplate(config, template))
        {
            // get prefix
            this.prefix = config["prefix"];
            // get verbose level
            this.verbose = config["verbose"];
            // check directories
            let directories = config["startdirectories"];
            directories.forEach(dir =>
            {
                if (!fs.exists(dir))
                {
                    fs.mkdir(dir);
                }
                this.startDirectories.push(dir);
            });
            // get authorized users
            let users = config["authorizedusers"];
            users.forEach(user =>
            {
                if ((user as string)?.match(/([A-Za-z0-9]+#+[0-9999])\w+/))
                {
                    this.authorizedUsers.push(user);
                }
            });
        }
        else
        {
            if (!fs.exists("./config/config.json"))
            {
                throw new ConfigurationError();
            }
            else if (!JSONParser.matchTemplate(fs.readFile("./config/config.json"), template))
            {
                throw new ConfigurationError("Configuration file is malformed, please check file integrity.");
            }
        }
    }

    public static getPath(): string
    {
        return this.path;
    }

    public static getDirectories(): string[]
    {
        return this.startDirectories;
    }

    public static getPrefix(): string
    {
        return this.prefix;
    }

    public static setPrefix(prefix: string): void
    {
        this.prefix = prefix;
    }

    public static getVerbose(): number
    {
        return this.verbose;
    }

    public static getAuthorizedUsers(): string[]
    {
        return this.authorizedUsers;
    }
}