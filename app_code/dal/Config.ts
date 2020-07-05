import { FileSystem as fs } from './FileSystem';
import { ConfigurationError } from '../errors/dal_errors/ConfigurationError';
import { JSONParser } from '../helpers/JSONParser';

export class Config
{
    private _prefix: string;
    private _authorizedUsers: string[];
    private readonly _verbose: number;
    private readonly _startDirectories: string[];

    public get prefix() { return this._prefix; }
    public set prefix(prefix: string)
    {
        this._prefix = prefix;
    }

    public get authorizedUsers() { return this._authorizedUsers; }

    public get verbose() { return this._verbose; }

    public get startDirectories() { return this._startDirectories; }

    public constructor()
    {
        const template = { "prefix": "", "authorizedusers": [""], "verbose": 1, "startdirectories": [""] };
        if (fs.exists("./config/config.json") &&
            JSONParser.matchTemplate(fs.readFile("./config/config.json"), template))
        {
            let config = JSON.parse("./config/config.json");
            // check directories
            let directories = config["startDirectories"];
            directories.forEach(dir =>
            {
                if (!fs.exists(dir))
                {
                    fs.mkdir(dir);
                }
            });

        }
        else
        {
            throw new ConfigurationError();
        }
    }

    private checkConfig(directories: string[]): void
    {
        // initiate directories
        /*const directories = ["./files", "./files/downloads", "./files/logs"];*/
        for (var i = 0; i < directories.length; i++)
        {
            if (!fs.exists(directories[i]))
            {
                fs.mkdir(directories[i]);
            }
        }
    }
}