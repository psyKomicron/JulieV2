# Julie
## **How to use commands**
Each commande starts with what is called a prefix (by default for this bot it's "/"). For example to create a vote you need to send `/vote` or else the bot will not understand it as a command. After that comes what is called arguments, those who have dealt a bit with command lines on Unix/NT systems know what i am talking about. Arguments a things (parameters) that you can give to a command to set it's parameters. If we take the `/vote` example you can give a few parameters :
 - `-n` : (n for number) this will set how long the vote will stay active in seconds.
 - `-r` : (r for reason) this will set the title of the vote.

 We can take the `/delete` command also for example :
 - `-n` : to set the number of messages to delete.
 - `-u` : (u for user) to only delete the messages of the user.

 As you can see I tried to have a user-friendly syntax and to keep arguments names for parameters with the same type. `-n` will indicate a number of some sort for example.


## Commands (kinda up-to-date)
|Command      | Command name  | Description |
|:------------|:-------------:|:------------|
| Delete messages  |`/delete`, `/d` | Deletes a given number of messages in a given channel. If `-u` is used, deletes only the messages send by the specified user.|
| Download files from a channel |`/download`, `/dl` | Downloads a given number of a given type of files in a given channel.|
| Creates a embed    | `/embed` | Creates a `MessageEmbed` (look at discordjs documentation) from a json file attached to the message. The channel in wich the message will be sent can be specified & the message can be deleted after execution adding `-d` to the command.|
| Help     | `/help` | Shows a link to this github repository.|
| Vote system     | `/vote`, `/v` | Creates a poll/vote. You can set the vote title, how long the vote will be active, where the vote message will be sent or on wich message to create the vote. |
| Play | `/play` | Plays a youtube video in a given channel, with of course a provided youtube link. Good to use with the explore command to search for a video. |
| ExploreCommand | `/explore` | Start a search on a Wikipedia or Youtube on a keyword and display the result of the search in the channel. The search on Youtube will be made using YouTube search algorithms. |
|Show authorized users | `/showusers` | Sends a embed (formatted message) to the channel showing every user authorized to use the bot. Other users can be added using the `/adduser` command or by editing the .json configuration file (.\\config\\config.json -> field "`authorizedUsers`")|
| Add user | `/adduser` | Add a user to the authorized user list (those who can use the bot and it's commands).|

### Help
Sends a embed with a link to this github page.
- `/help`

### Vote
Creates a poll system using a `Discord.MessageEmbed` and `Discord.ReactionCollector`. Does not support yet a lot of reactions.
- `/vote -n [timeout for the poll in seconds] -c [channel snowflake/id] -r [title of the poll/vote]`

### Delete messages
Deletes a given number of messages in a channel, can be set to delete a specified user's messages. If the `-c` argument is provided the bot will delete messages in the given channel (channel id can be obtained by right clicking the channel's name in Discord).
- `/delete -n [number of messages] -c [channel snowflake/id] -u [discord username]` (ex: user#1234)

### Play
Classic bot command, give the bot a link to a youtube video and it will play it in the channel that you are connected to, or, you can give a vocal channel id to connect to and let your imagination do the rest.
