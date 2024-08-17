import { getDocument } from "@/firebase";
import { StoredPortalData } from "@/types/portalData";
import { log } from "@/utils/handlers";

type StoredPortalsData = Omit<StoredPortalData, "channelId">;
export const portalsData: { [key: number]: StoredPortalsData } = {};

export async function syncPortalsData() {
  log("Syncing portals data...");

  const portalData = await getDocument<StoredPortalData>({
    collectionName: "portal_data",
  });

  for (const portal of portalData) {
    const { channelId, ...rest } = portal;
    portalsData[channelId] = rest;
  }

  log("✅ Synced portals data");
}
