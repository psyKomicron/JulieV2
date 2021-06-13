import { EmptyTokenError } from "../../errors/dal_errors/EmptyTokenError";
import { Config } from "../Config";

export class TokenReader
{
    public static getToken<K extends keyof typeof Token>(tokenName: K): string 
    {
        switch (tokenName)
        {
            case "youtube":
                return Config.getKey("youtubeApiKey");
            case "release":
                return Config.getKey("release");
            case "discord":
                return Config.getKey("discordBotKey");
        }
        
        throw new EmptyTokenError("Could not get token from env variable. Token name : " + tokenName);
    }
}

enum Token 
{
    youtube, release, discord
}
