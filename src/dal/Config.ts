import { FileSystem as fs } from './FileSystem';
import { ConfigurationError } from '../errors/dal_errors/ConfigurationError';
import { JSONParser } from '../helpers/JSONParser';
import { EventEmitter } from 'events';
import { User } from 'discord.js';
import { Printer } from '../console/Printer';
import { EmojiReader } from './readers/EmojiReader';

/**The parameters are loaded into the class attribute with the init() method. */
export class Config extends EventEmitter
{
    // self
    private static readonly config = new Config();
    private static isInit: boolean = false;
    private static readonly configTemplate = { "prefix": "", "authorizedusers": [""], "verbose": 1, "startdirectories": [""] };
    // external
    private static prefix: string;
    private static startDirectories: Array<string> = new Array<string>();
    private static authorizedUsers: Array<string> = new Array<string>();
    private static verbose: number;
    private static keys: Map<string, string> = new Map<string, string>();
        // paths
    private static readonly path = "./config/config.json";
    private static readonly emojisFilePath: string = "./config/emojis.json";
    private static readonly downloadPath: string = "./files/downloads/";
    private static readonly gitRepoPath: string = "https://github.com/psyKomicron/Julie/"

    // #region getters
    public static init()
    {
        if (!this.isInit)
        {
            if (fs.exists(this.path))
            {
                let config = JSON.parse(fs.readFile(this.path).toString());
                if (JSONParser.matchTemplate(config, this.configTemplate))
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
                        if ((user as string)?.match(/[A-Za-z0-9]+#+[0-9]{3,}/))
                        {
                            this.authorizedUsers.push(user);
                        }
                    });
                    
                    // get api keys
                    let keys = config["keys"];
                    keys.forEach(pair => 
                    {
                        if (pair.value.match(/^[A-z0-9.]+(?! )[A-z0-9.]+$/g) && !pair.key.match(/ +/))
                        {
                            this.keys.set(pair.key, pair.value);
                        }
                        else 
                        {
                            throw new ConfigurationError("API key does not match required format (chars without spaces) or key name contains a space");
                        }
                    });
                }
                else
                {
                    throw new ConfigurationError("Configuration file is malformed, please check file integrity.");
                }

                EmojiReader.init();
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

        if (JSONParser.matchTemplate(configFile, this.configTemplate))
        {
            let authorizedUsers = configFile.authorizedusers;
            if (authorizedUsers && authorizedUsers instanceof Array)
            {
                try
                {
                    authorizedUsers.push(user.tag);
                    this.config.emit("addUser", user);
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

    public static getEmojisFilePath(): string
    {
        return this.emojisFilePath;
    }
    
    public static getDownloadPath(): string
    {
        return this.downloadPath;
    }

    public static getGitRepoPath(): string
    {
        return this.gitRepoPath;
    }

    public static getPrefix(): string
    {
        return this.prefix;
    }

    public static setPrefix(prefix: string): void
    {
        this.prefix = prefix;
        this.config.emit("prefixChange", prefix);
    }

    public static getKeys(): Map<string, string>
    {
        return this.keys;
    }

    public static getKey(keyName: string): string 
    {
        let value = this.keys.get(keyName);
        if (!value)
        {
            throw new ConfigurationError("The key does not exist (" + keyName + ")");
        }
        return value;
    }
    // #endregion

    public static emitEvent<T extends keyof ConfigEvents>(event: T, ...args: ConfigEvents[T]): void
    {
        this.config.emit(event, ...args);
    }

    public static onEvent<T extends keyof ConfigEvents>(event: T, listener: (...args: ConfigEvents[T]) => void): Config
    {
        return this.config.on(event, listener);
    }
}

export interface ConfigEvents
{
    prefixChange: [string];
    addUser: [User];
    verboseChange: [number];
}