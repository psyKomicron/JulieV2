
export class TokenReader
{
    public static getToken(tokenName: "youtube" | "release" | "discord"): string 
    {
        let tokenValue = "";
        switch (tokenName)
        {
            case "youtube":
                tokenValue = process.env.API_KEY;
                break;
            case "release":
                tokenValue = process.env.release;
                break;
            case "discord":
                tokenValue = process.env.token;
                break;
        }
        if (!tokenValue)
        {
            console.error("Could not get token env variable");
        }
        return tokenValue;
    }
}