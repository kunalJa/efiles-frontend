import { redirect } from "next/navigation";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const { canceled } = await searchParams;
  redirect(canceled === "1" ? "/?canceled=1" : "/");
}
