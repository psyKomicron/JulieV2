import readline = require('readline');
import { clearInterval } from 'timers';
import { FileSystem as fs, TokenReader } from "../helpers/dal/Readers";
import { Client, Message } from 'discord.js';
import { Moderator } from './command_modules/moderation/Moderator';
import { DefaultLogger } from './command_modules/logger/loggers/DefaultLogger';
import { Logger } from './command_modules/logger/Logger';
import { Printer } from '../console/Printer';
import { ExecutionError } from '../errors/ExecutionError';
import { CommandFactory } from '../helpers/factories/CommandFactory';

export class Bot 
{
    // own
    private moderator: Moderator;
    private _logger: Logger = new DefaultLogger();
    private prefix: string = "/";
    private readonly parents = ["psyKomicron#6527", "desmoclublyon#3056", "marquez#5719", "Onyxt#9305"];
    private readonly verbose: boolean = true;
    // discord
    private readonly _client: Client = new Client();

    public constructor(id: NodeJS.Timeout) 
    {
        this.moderator = Moderator.get(this);
        this.init(id);
    }

    public get client(): Client { return this._client; }

    public get logger(): Logger { return this._logger; }

    private init(id: NodeJS.Timeout): void
    {
        // initiate directories
        const directories = ["./files", "./files/downloads", "./files/logs"];
        for (var i = 0; i < directories.length; i++)
        {
            if (!fs.exists(directories[i]))
            {
                fs.mkdir(directories[i]);
            }
        }
        // initiate bot
        this._client.on("ready", () =>
        {
            clearInterval(id);
            readline.moveCursor(process.stdout, -4, 0);
            process.stdout.write(`READY\n${Printer.error("-------------------------------------")}\n`);
        });
        this._client.on("message", (message) => { this.onMessage(message); });
        this._client.on("disconnect", (arg_0, arg_1: number) => 
        {
            console.log("Client disconnected :");
            console.log(`${JSON.stringify(arg_0)}, ${arg_1}`);
        })
        this._client.login(TokenReader.getToken("discord"));
    }

    private onMessage(message: Message): void 
    {
        // asynchronously moderates a message
        try
        {
            this.moderator.execute(message);
        } catch (error)
        {
            if (error instanceof ExecutionError)
            {
                console.error(error.message);
            }
            else
            {
                console.error(error);
            }
        }
        let content = message.content;
        if (content.startsWith(this.prefix) && this.parents.includes(message.author.tag))
        {
            console.log("\ncommand requested by : " + Printer.info(message.author.tag));
            let substr = 0;
            let name = "";
            // replace with a regex
            while (substr < content.length && content[substr] != "-" && content[substr] != " ")
            {
                name += content[substr];
                substr++;
            }
            try
            {
                let handled = this.logger.handle(message);
                if (!handled)
                {
                    let command = CommandFactory.create(name.substr(1), this);
                    command.execute(message)
                        .catch(error =>
                        {
                            if (error instanceof ExecutionError)
                            {
                                console.error(Printer.error(`${error.name} failed : ${error.message}`));
                                if (this.verbose)
                                {
                                    message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
                                }
                            }
                            else if (this.verbose)
                            {
                                console.error(error);
                                message.author.send("Uh oh... Something went wrong ! Try again !");
                            }
                        });
                }
            } catch (error)
            {
                if (error instanceof ExecutionError)
                {
                    if (this.verbose)
                    {
                        console.error(Printer.error(error.message));
                        message.author.send(`Command (\`${error.name}\`) failed. Message : \n${error.message}`);
                    }
                }
                else if (this.verbose)
                {
                    console.error(error);
                    message.author.send("Uh oh... Something went wrong ! Try again !");
                }
            }
        }
    }
}

export enum FileType
{
    PDF = "pdf",
    IMG = "image",
    VIDEO = "video",
    CODE = "code",
    FILE = "all",
}