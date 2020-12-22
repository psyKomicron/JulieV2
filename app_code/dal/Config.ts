import { FileSystem as fs } from './FileSystem';
import { ConfigurationError } from '../errors/dal_errors/ConfigurationError';
import { JSONParser } from '../helpers/JSONParser';
import { EventEmitter } from 'events';
import { User } from 'discord.js';
import { Printer } from '../console/Printer';

/**The parameters are loaded into the class attribute with the init() method. */
export class Config extends EventEmitter
{
    private static readonly config = new Config();
    private static readonly path = "./config/config.json";
    private static isInit: boolean = false;

    private static prefix: string;
    private static startDirectories: Array<string> = new Array();
    private static authorizedUsers: Array<string> = new Array();
    private static verbose: number;

    public static init()
    {
        if (!this.isInit)
        {
            let config = JSON.parse(fs.readFile("./config/config.json").toString());

            const template = { "prefix": "", "authorizedusers": [""], "verbose": 1, "startdirectories": [""] };

            if (fs.exists("./config/config.json"))
            {
                if (JSONParser.matchTemplate(config, template))
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
                    throw new ConfigurationError("Configuration file is malformed, please check file integrity.");
                }
            }
            else
            {
                throw new ConfigurationError("Configuration file is either not present, or not accessible. Please check.");
            }
        }
        else
        {
            throw new ConfigurationError("Configuration file has already been loaded. Do not instanciate the Config class twice.");
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

    public static getVerbose(): number
    {
        return this.verbose;
    }

    public static getAuthorizedUsers(): Array<string>
    {
        return this.authorizedUsers;
    }

    public static addAuthorizedUser(user: User)
    {
        let configFile = JSON.parse(fs.readFile(this.path).toString());

        if (JSONParser.matchTemplate(configFile, { "prefix": "", "authorizedusers": [""], "verbose": 1, "startdirectories": [""] }))
        {
            let authorizedUsers = configFile.authorizedUsers;
            if (authorizedUsers && authorizedUsers instanceof Array)
            {
                try
                {
                    authorizedUsers.push(user.tag);
                    this.emit("added-user", user);
                }
                catch (error)
                {
                    Printer.error(error.toString());
                }
            }
            else
            {
                throw new ConfigurationError("Configuration file is malformed, please check file integrity.");
            }
        }
    }

    public static getPrefix(): string
    {
        return this.prefix;
    }

    public static setPrefix(prefix: string): void
    {
        this.prefix = prefix;
        this.config.emit("prefix-change", prefix);
    }

    public static emit(event: string | symbol, ...args: any[]): void
    {
        this.config.emit(event, ...args);
    }

    public static on(event: "prefix-change"| "added-user", listener: (...args: any[]) => void): void
    {
        this.config.on(event, listener);
    }
}