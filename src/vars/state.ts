export const userState: { [key: number]: string } = {};

export interface PortalDataInput {
  link: string;
  media: string;
  text: string;
  channelId: number;
}

export const portalDataInput: { [key: number]: PortalDataInput } = {};
export function updatePortalDataInput<K extends keyof PortalDataInput>(
  chatId: number,
  key: K,
  value: PortalDataInput[K]
) {
  portalDataInput[chatId] = { ...portalDataInput[chatId], [key]: value };
}
