export class Tools
{
    /**
     * Iterates through the string to get the command name from a message received by the bot
     * Will stop if the message is too long
     * @param content
     */
    public static getCommandName(content: string): string
    {
        let substr = 0;
        let name = "";
        // replace with a regex
        while (substr < 100 && substr < content.length && content[substr] != "-" && content[substr] != " ")
        {
            name += content[substr];
            substr++;
        }
        return name;
    }

    public static getUrlRegex(): RegExp
    {
        return new RegExp(/(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
    }

    public static isUrl(url: string): boolean
    {
        return url.match(this.getUrlRegex()) != undefined;
    }
}