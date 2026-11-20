import type { Metadata } from "next";
import { ModelCardView } from "./ModelCardView";

export const metadata: Metadata = { title: "Model card | CUORE" };

export default function Page() {
  return <ModelCardView />;
}
