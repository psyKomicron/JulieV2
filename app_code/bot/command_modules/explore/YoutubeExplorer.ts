import { Explorer } from "./Explorer";
import { YoutubeModule } from "./youtube/YoutubeModule";
import { TokenReader } from "../../../dal/readers/TokenReader";
import { EmptyTokenError } from "../../../errors/dal_errors/EmptyTokenError";
import { Printer } from "../../../console/Printer";
import { EmbedFactory } from "../../../helpers/factories/EmbedFactory";
import { EmbedResolvable } from "../../../viewmodels/EmbedResolvable";

export class YTExplorer extends Explorer
{
    public async explore(): Promise<void> 
    {
        try
        {
            let ytModule = new YoutubeModule(TokenReader.getToken("youtube"));
            ytModule.searchVideos(this.keyword, 10, "en")
                .then(res => this.workFromResponse(res))
                .catch(console.error);
        } catch (e)
        {
            if (e instanceof EmptyTokenError)
            {
                console.log(Printer.error("YoutubeModule cannot log in with an empty token"));
                console.error(e.message);
            }
        }
    }

    private workFromResponse(res: any): void
    {
        let embed = EmbedFactory.build(new EmbedResolvable()
            .setTitle("Youtube")
            .setDescription(`Youtube search for \`${this.keyword}\``)
            .setFooter("made by Julie"));

        for (var i = 0; i < 10 && i < res.items.length; i++)
        {
            let item = res.items[i];
            let name = "**" + item.title + "**";
            let value = item.videoURL;
            if (name && value)
            {
                embed.addField(name, value);
            }
        }
        embed.setURL(res.items[0].videoURL);
        this.send(embed);
    }
}