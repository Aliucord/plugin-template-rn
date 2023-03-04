import { Plugin } from "aliucord/entities";
import {
  ReactNative,
  FluxDispatcher,
  SelectedChannelStore,
  UserStore,
} from "aliucord/metro";
import { Settings } from "aliucord/api/Settings";
import { createScreen } from "aliucord/ui/utils";

import SettingsPage from "./settingsPage";

import { Message, ReactionEmoji } from "discord-types/general";
import { Logger } from "aliucord/utils/Logger";

const MOYAI = "🗿";
const MOYAI_URL =
  "https://raw.githubusercontent.com/MeguminSama/VencordPlugins/main/plugins/moyai/moyai.mp3";

interface IMessageCreate {
  type: "MESSAGE_CREATE";
  optimistic: boolean;
  isPushNotification: boolean;
  channelId: string;
  message: Message;
}

interface IReactionAdd {
  type: "MESSAGE_REACTION_ADD";
  optimistic: boolean;
  channelId: string;
  messageId: string;
  userId: "195136840355807232";
  emoji: ReactionEmoji;
}

interface IVoiceChannelEffectSendEvent {
  type: string;
  emoji?: ReactionEmoji; // Just in case...
  channelId: string;
  userId: string;
  animationType: number;
  animationId: number;
}

let sound_id = 4000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MoyaiSettings {
  ignoreBots: boolean;
  volume: number;
}

// no one steal this k thx
let soundId = 4000;

// Port of https://github.com/Vendicated/Vencord/blob/main/src/plugins/moyai.ts
export default class Moyai extends Plugin<MoyaiSettings> {
  private realSettings: MoyaiSettings = {};
  private soundManager = ReactNative.NativeModules.DCDSoundManager

  private updateSettings() {
    this.realSettings.ignoreBots = this.settings.get("ignoreBots", true);
    this.realSettings.volume = this.settings.get("volume", 0.5);
  }

  async boom() {
    console.log("🗿 vine boom! 🗿");
    try {
      soundId++;
      await new Promise((resolve) =>
        // "notification", "ring_tone", "voice"
        this.soundManager.prepare(MOYAI_URL, "notification", soundId, resolve)
      );
      this.soundManager.setVolume(soundId, this.realSettings.volume);
      this.soundManager.play(soundId);
      // soundManager.release(MOYAI_SOUND_ID);
    } catch (e) {
      console.error("could not play sound:", e);
    }
  }

  // i hate "this".
  onMessage = async (e: IMessageCreate) => {
    if (e.optimistic || e.type !== "MESSAGE_CREATE") return;
    if (e.message.state === "SENDING") return;
    if (this.realSettings.ignoreBots && e.message.author?.bot) return;
    if (!e.message.content) return;
    if (e.channelId !== SelectedChannelStore.getChannelId()) return;

    const moyaiCount = getMoyaiCount(e.message.content);

    for (let i = 0; i < moyaiCount; i++) {
      await this.boom();
      await sleep(300);
    }
  };

  onReaction = async (e: IReactionAdd) => {
    if (e.optimistic || e.type !== "MESSAGE_REACTION_ADD") return;
    if (this.realSettings.ignoreBots && UserStore.getUser(e.userId)?.bot)
      return;
    if (e.channelId !== SelectedChannelStore.getChannelId()) return;

    const name = e.emoji.name.toLowerCase();
    if (name !== MOYAI && !name.includes("moyai") && !name.includes("moai"))
      return;

    await this.boom();
  };

  onVoiceChannelEffect = async (e: IVoiceChannelEffectSendEvent) => {
    if (!e.emoji?.name) return;
    const name = e.emoji.name.toLowerCase();
    if (name !== MOYAI && !name.includes("moyai") && !name.includes("moai"))
      return;

    await this.boom();
  };

  public async start() {
    this.updateSettings();
    FluxDispatcher.subscribe("MESSAGE_CREATE", this.onMessage);
    FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", this.onReaction);
    FluxDispatcher.subscribe(
      "VOICE_CHANNEL_EFFECT_SEND",
      this.onVoiceChannelEffect
    );
  }

  public async stop() {
    FluxDispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);
    FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", this.onReaction);
    FluxDispatcher.unsubscribe(
      "VOICE_CHANNEL_EFFECT_SEND",
      this.onVoiceChannelEffect
    );
  }

  SettingsModal = createScreen({
    title: MOYAI,
    render: () => (
      <SettingsPage
        _settings={this.settings}
        onChange={() => this.updateSettings()}
      />
    ),
  });
}

function countOccurrences(sourceString: string, subString: string) {
  let i = 0;
  let lastIdx = 0;
  while ((lastIdx = sourceString.indexOf(subString, lastIdx) + 1) !== 0) i++;

  return i;
}

function countMatches(sourceString: string, pattern: RegExp) {
  if (!pattern.global) throw new Error("pattern must be global");

  let i = 0;
  while (pattern.test(sourceString)) i++;

  return i;
}

const customMoyaiRe = /<a?:\w*moy?ai\w*:\d{17,20}>/gi;

function getMoyaiCount(message: string) {
  // TODO: match "vine boom" as well
  const count =
    countOccurrences(message, MOYAI) + countMatches(message, customMoyaiRe);

  return Math.min(count, 10);
}
