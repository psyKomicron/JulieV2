# Julie
# **How to use commands**
Each command starts with what is called a prefix (by default for this bot it's "/"). For example to create a vote you need to send `/vote` or else the bot will not understand it as a command. After that comes what is called arguments, those who have dealt a bit with command lines on Linux/NT systems know what i am talking about. Arguments a things (parameters) that you can give to a command to set it's parameters. If we take the `/vote` example you can give a few parameters :
 - `-n` : (n for number) this will set how long the vote will stay active in seconds.
 - `-r` : (r for reason) this will set the title of the vote.

 We can take the `/delete` command also for example :
 - `-n` : to set the number of messages to delete.
 - `-u` : (u for user) to only delete the messages of the user.

 As you can see I tried to have a user-friendly syntax and to keep arguments names for parameters with the same type. `-n` will indicate a number of some sort for example.


# Commands (kinda up-to-date)
Chosen prefix is `/`, but it can change based on your own bot configuration.
|Command      | Command name  | Description |
|:------------|:-------------:|:------------|
| [Delete messages](#delete)  |`delete`, `d` | Deletes a given number of messages in a given channel. If `-u` is used, deletes only the messages send by the specified user.|
| [Download files from a channel](#download) |`download`, `dl` | Downloads a given number of a given type of files in a given channel.|
| [Creates an embed](#embed)    | `embed` | Creates a `MessageEmbed` (look at discordjs documentation) from a json file attached to the message. The channel in wich the message will be sent can be specified & the message can be deleted after execution adding `-d` to the command.|
| [Help](#help)     | `help` | Shows a link to this github repository :tf: .|
| [Vote](#vote) | `vote`, `v` | Creates a poll/vote. You can set the vote title, how long the vote will be active, where the vote message will be sent or on wich message to create the vote. |
| [Play](#play) | `play` | Plays a youtube video in a given channel. Can be used with either a link or a keyword |
| [Explore](#explore) | `explore`, `search`, `e` | Start a search on a Wikipedia or Youtube on a keyword and display the result of the search in the channel. The search on Youtube will be made using YouTube search algorithm. |
| [Show authorized users](<#show-users>) | `showusers` | Sends a embed (formatted message) to the channel showing every user authorized to use the bot. Other users can be added using the `adduser` command or by editing the `.json` configuration file |
| [Add user](<#add-user>) | `adduser` | Add a user to the authorized user list (those who can use the bot and it's commands).|
| [Change prefix](#prefix) | `changeprefix`, `prefix` | Change the prefix for the bot commands |
| [Clean channel](#clean-channel) | `clean`, `c` | "Cleans" a channel. If you have a channel dedicated for pictures/files and should have a maximum amount of text messages to avoid clogging the channel, `clean` will clean those unwanted text messages. |

## Help
- `help`
Sends an embed with a link to this github page (sometimes it does not). Provide the command with the name of another command and it will send you to the right section of this document. 


### Arguments
- `[command name]` : Name of the command you need help with.
### Example(s)
Sends an embed with a link to the right README section i.e. it will send you to [Vote](#vote))
```sh
/help vote
```
Others examples :
```sh
/help delete
/help download
/help vote
/help ...
```

## Vote
- `vote` Creates a poll/vote system using a `Discord.MessageEmbed` and `Discord.ReactionCollector`. When you create a vote, the bot will send a message (an embed) to the current channel (unless instructed otherwise). Users vote by interacting with the embed, adding reactions/emojis/emoticons to it. Votes have a time limit, by default 1 minute, but it can be extended with the `-n` timeout option. Every vote has a identifier (located in the footer of the embed), this identifier can be used to terminate the vote early with the `end` command.
 If the `-displayusers` option has been added, at the end of the vote the users will be shown with their respective votes.

### Arguments
- `-r`, `-title` : title of the poll (title of the embed generated by the command).
- `-n`, `-timeout` : how long will the poll be live for in seconds. If you set the argument to `nolimit` (`-n nolimit`) the vote will not have a timeout, and can only be stop by using the `end` command.
- `-c`, `-channel` : channel id to send the vote message to.
- `-m`, `-message` : message id to attach the vote to. The message must be an embed, and must have been sent by the bot (if it hasn't been sent by the bot, the bot cannot edit it).
- `-e`, `-reactions` : the only reactions to be interpreted as votes, must be surrounded by quotes and separeted by spaces. Those reactions will be added to the vote embed.
- `-displayusers` : argument can be set to `true`, `yes`, `y` (and their respective opposites) or just append it to display users that voted (with their usernames) at the end of the vote.

## Delete
- `delete` Deletes a given number of messages in a channel, can be set to delete a specified user's messages. If the `-c` argument is provided the bot will delete messages in the given channel (channel id can be obtained by right clicking the channel's name in Discord).
### Arguments
- `[no args]` : number of messages to delete. They will be deleted from the current channel and pinned messages will not be deleted.
- `-n` (number of messages) : number of messages to delete.
- `-c` (channel snowflake/id) : the channel to delete messages from (by default it is the same channel as the command message).
- `-u` (discord username) : use to delete messages only from a single user (you need to provide the full discord username : name+tag).
- `-p` (pinned) : use to delete pinned messages (by default the command will not delete the messages that have been pinned).

## Play
- `play` Plays the provided youtube url (a video or a playlist) in a voice channel. If the bot is already playing audio, using the command will queue the url. The bot by default will join the voice channel you are connected to (if you are connected to one).

### Arguments
- `[no args]` : either a keyword, a video link or a playlist link. Example: `[prefix]play "never gonna give you up"`.
- `-u`, `-url` : the video/playlist url
- `-k`, `-keyword` : if you don't want to search for a url on yourself, you can ask for the command to search on youtube for the keyword. If the search result has more than one result the command will send back an embed with the results and their respective link. It the search has only one result, it will directly play the audio.
- `-c`, `-channel` : to override the default "join user" behavior, specify a voice channel id, and the bot will connect to the voice channel with the matching id in the current guild.

## Clean channel
- `clean` Cleans a channel with default parameters : 3 messages per user and deletes messages sent only today.
### Arguments :
- `-a` (all). Get 300 messages instead of only today's messages (the bound limit can be set higher in the code).
- `-p` (preview). Sends an embed in the message's channel of the messages selected to be deleted. The embed will list the content of the selected messages (shortened to 10 first, 10 last chars)

## Prefix
- `prefix`, `changeprefix` : Changes the bot prefix (the famous char that you need to put at the beginning for the bot to interpret your message). The prefix needs to follow the following rules :
    - None, it can be anything.

### Arguments
- `-p [prefix]` (`prefix`). Value for the prefix.

*If you have the message : "prefix not valid" it means the prefix couldn't be parsed from the message, and thus the command was given an empty prefix.*

## Add user
- `adduser`, `add`, `a` : Adds a user to the list of users authorized to use the bot. Effect is immediate.

*The command is not yet finished, so it's behavior may change*

## Show users
- `showusers`, `su` : Shows (sends an embed to the channel) the users authorised to use the bot.

## Explore
- `explore`, `search`, `e` : Search with keyword on either YouTube or Wikipedia.
### Arguments
- `-k`, `-keyword` : Keyword for the search. Nothing to crazy about it. If it contains a - or a space, surround it with quotes. 
- `-yt`, `-youtube` : Sets the search to be on youtube.
- `-w`, `-wiki` : Sets the search to be on wikipedia
    - *Note: the -yt/youtube and -w/wiki are mutually exlusive. Meaning that if you use one, you mustn't use the other*

## Embed
**Planning on removing it or heavily changing it's behavior, so for now it's help page will remain blank**

## Download
- `dl`, `download` : Downloads n image files (.png, .jpg, .gif, .bmp) from a channel.
### Arguments
- `-n` : Number of files to download.
