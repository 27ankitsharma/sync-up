import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "YOUR_PROJECT_ID", // TODO: Replace with your Sanity project ID
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
