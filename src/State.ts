import type { AutocompleteResult } from "revolt-toolset/dist/autocomplete";
import type { Channel, Message, Server } from "revolt.js";
import { writable } from "svelte/store";

export const fetchedMembers = new Set<string>();

export const SelectedServer = writable<Server | null>(null);
let serverID = "";
SelectedServer.subscribe((s) => {
  serverID = s?._id || "";
  if (!s || fetchedMembers.has(s._id)) return;
  fetchedMembers.add(s._id);
  s.fetchMembers().then(() => s._id == serverID && SelectedServer.set(s));
});
export const SelectedChannel = writable<Channel | null>(null);

let messagecachelocal: { [key: string]: Message[] } = {};
export const MessageCache = writable(messagecachelocal);
MessageCache.subscribe((d) => (messagecachelocal = d));
export function pushMessages(channel: Channel, msgs: Message[]) {
  messagecachelocal[channel._id] = (messagecachelocal[channel._id] || []).filter(
    (c) => !msgs.find((m) => m._id == c._id)
  );
  messagecachelocal[channel._id].push(...msgs);
  messagecachelocal[channel._id].sort((m1, m2) => m1.createdAt - m2.createdAt);
  MessageCache.set(messagecachelocal);
}

export const uploadedFiles = writable<{ name: string; type: string; url: string; data: File }[]>(
  []
);

export const MessageInputSelected = writable<boolean>(false),
  autocomplete = writable<AutocompleteResult | null>(null);

export const MobileLayout = writable<boolean>(false);
export const AppHeight = writable<number>(window.innerHeight);
export const AppWidth = writable<number>(window.innerWidth);
function recalcMobileLayout() {
  MobileLayout.set(window.innerWidth <= 600);
  AppHeight.set(window.innerHeight);
  AppWidth.set(window.innerWidth);
}
window.addEventListener("resize", recalcMobileLayout);
window.addEventListener("orientationchange", recalcMobileLayout);
window.addEventListener("focus", recalcMobileLayout);
recalcMobileLayout();
setInterval(recalcMobileLayout, 65);

export const pendBottom = writable<boolean>(false);
export const selectInput = writable<HTMLInputElement | null>(null);
