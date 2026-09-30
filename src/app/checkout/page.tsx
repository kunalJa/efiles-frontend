import { redirect } from "next/navigation";

export default function CheckoutPage({ searchParams }: { searchParams: { canceled?: string } }) {
  redirect(searchParams.canceled === "1" ? "/?canceled=1" : "/");
}
