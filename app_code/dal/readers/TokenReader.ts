import { EmptyTokenError } from "../../errors/dal_errors/EmptyTokenError";

export class TokenReader
{
    public static getToken(tokenName: Token): string 
    {
        let tokenValue = "";
        switch (tokenName)
        {
            case "youtube":
                tokenValue = process.env.YOUTUBE_API_KEY;
                break;
            case "release":
                tokenValue = process.env.RELEASE_TYPE;
                break;
            case "discord":
                tokenValue = process.env.DISCORD_BOT_TOKEN;
                break;
        }
        if (!tokenValue)
        {
            throw new EmptyTokenError("Could not get token from env variable. Token name : " + tokenName);
        }
        return tokenValue;
    }
}

type Token = ("youtube" | "release" | "discord");