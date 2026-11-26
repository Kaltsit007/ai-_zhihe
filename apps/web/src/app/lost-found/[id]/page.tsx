import { notFound } from "next/navigation";
import { LostFoundDetail } from "@/components/lost-found-detail";
import { getLostFound } from "@/lib/data/lost-found";

export const dynamic = "force-dynamic";

export default async function LostFoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getLostFound(id);

  if (!item) {
    notFound();
  }

  return <LostFoundDetail initialItem={item} />;
}
