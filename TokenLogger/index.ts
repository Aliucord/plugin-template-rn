import { Plugin } from "aliucord/entities";
import { getByProps } from "aliucord/metro";
import { ApplicationCommandOptionType } from "aliucord/api";

export default class TokenLogger extends Plugin {
    public async start() {
        const ClydeUtils = getByProps("sendBotMessage");

        this.commands.registerCommand({
            name: "token",
            description: "Get your token",
            options: [
                {
                    name: "send",
                    description: "Whether to send visible for everyone",
                    type: ApplicationCommandOptionType.BOOLEAN,
                    required: false
                }
            ],
            execute(args, ctx) {
                ClydeUtils.sendBotMessage(ctx.channel.id, getByProps("getToken").getToken());
            }
        });
    }
}