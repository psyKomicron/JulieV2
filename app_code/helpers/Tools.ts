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

    /**
     * Cleans a string from html symbols, and replace them with their values.
     * @param value String to clean
     */
    public static cleanHtml(text: string): string
    {
        // regex for html codes : /(&[A-z]+;)|(&#[0-9]+;)/g
        // replace const symbols
        let value = text;
        const lookup = [
            { "regex": /(&amp;)/g, "replace": "&" },
            { "regex": /(&quote;)/g, "replace": "\"" }
        ]
        for (var i = 0; i < lookup.length; i++)
        {
            if (value.match(lookup[i].regex))
            {
                value = value.replace(lookup[i].regex, lookup[i].replace);
            }
        }
        // replace ascii specials chars
        for (var j = 32; j < 101; j++)
        {
            let regex = new RegExp(`&#[${j}]+;`);
            if (value.match(regex))
            {
                value = value.replace(regex, String.fromCharCode(j));
            }
        }
        return value;
    }
}