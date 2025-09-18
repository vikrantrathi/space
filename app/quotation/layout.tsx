import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Quotation View - Startupzila Space",
  description: "View quotation details and take actions",
};

export default function QuotationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
