import type { Metadata } from "next";
import Link from "next/link";
import LegalSheet, { LegalSection, SupportEmail } from "@/components/LegalSheet";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How E-Files collects, uses, and shares personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalSheet
      title="privacy policy"
      summary="We collect only what we need to take payment, print your shirt, and deliver it. We do not sell your personal information."
    >
      <LegalSection id="scope" title="1. scope">
        <p>This Privacy Policy explains how E-Files (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares personal information when you visit this website or place an order. It is part of our <Link href="/terms" className="underline">Terms of Service</Link>.</p>
      </LegalSection>

      <LegalSection id="collect" title="2. information we collect">
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Order information you provide at checkout:</strong> your name, email address, phone number, billing details, shipping address, and selected shirt size. Checkout is hosted by Stripe.</li>
          <li><strong>Payment information:</strong> card details are entered directly into Stripe&rsquo;s PCI-compliant checkout. We never receive or store your full card number or security code.</li>
          <li><strong>Order records:</strong> an order reference, order status, assigned document, fulfillment status, and timestamps.</li>
          <li><strong>Device and technical information:</strong> your IP address, browser type, device information, and request logs, collected automatically by our hosting and infrastructure providers and by Stripe during checkout.</li>
          <li><strong>Communications:</strong> anything you send us by email.</li>
        </ul>
        <p>We do not use advertising or analytics tracking cookies on this website. Stripe may use cookies and similar technologies on its checkout pages for security and fraud prevention, as described in Stripe&rsquo;s privacy policy.</p>
      </LegalSection>

      <LegalSection id="use" title="3. how we use information">
        <p>We use personal information to process payments, fulfill and deliver orders, send order-related communications, provide customer support, prevent fraud and abuse, secure and operate the website, maintain business and tax records, calculate Net Profits for charitable donations, and comply with legal obligations.</p>
      </LegalSection>

      <LegalSection id="share" title="4. how we share information">
        <p>We share personal information only with service providers who need it to operate our business, and as required by law:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Stripe (payment processing and fraud prevention).</strong> We share, and Stripe collects directly, user data including your name, email address, phone number, billing details, shipping address, payment card information, device information, and IP address. Stripe uses this information to process payments, detect and prevent fraud, and comply with its legal obligations. See the <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Stripe Privacy Policy</a>.</li>
          <li><strong>Printful (third-party fulfillment center).</strong> We share your name, shipping address, email address, and phone number, along with your order details, with Printful so it can print, package, and ship your order. Printful may share this information with shipping carriers to deliver your package. See the <a href="https://www.printful.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="underline">Printful Privacy Policy</a>.</li>
          <li><strong>Resend (email delivery).</strong> We share your email address and order details, including your order reference, shirt size, amounts charged, and order-status link, with Resend so it can deliver order confirmation emails. See the <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Resend Privacy Policy</a>.</li>
          <li><strong>Infrastructure providers.</strong> Our website is hosted by Vercel, and order records are stored with Amazon Web Services. These providers process technical information and order records on our behalf.</li>
          <li><strong>Legal and safety.</strong> We may disclose information if required by law, subpoena, or court order, or to protect our rights, customers, or others from fraud or harm.</li>
          <li><strong>Business transfers.</strong> If the business is transferred or sold, information may be transferred as part of that transaction, subject to this policy.</li>
        </ul>
        <p><strong>We do not sell your personal information</strong> or share it for cross-context behavioral advertising. We do not share customer information with any charity or non-profit organization.</p>
      </LegalSection>

      <LegalSection id="retention" title="5. retention & security">
        <p>We keep order information for as long as needed to fulfill orders, handle disputes, and meet tax, accounting, and legal requirements, then delete or de-identify it. We use reasonable administrative and technical safeguards, including encrypted HTTPS connections and access-restricted cloud services, to protect personal information. No method of transmission or storage is completely secure.</p>
      </LegalSection>

      <LegalSection id="rights" title="6. your choices & rights">
        <p>You may request access to, correction of, or deletion of your personal information by emailing <SupportEmail />. Depending on where you live, you may have additional rights under state privacy laws. We will not discriminate against you for exercising them. We may need to verify your identity and may retain information we are legally required to keep.</p>
      </LegalSection>

      <LegalSection id="children" title="7. children">
        <p>This website is not directed to children under 13, and we do not knowingly collect their personal information. Orders may be placed only by adults.</p>
      </LegalSection>

      <LegalSection id="changes" title="8. changes & contact">
        <p>We may update this Privacy Policy by posting a revised version with a new &ldquo;last updated&rdquo; date. For privacy questions or requests, email <SupportEmail />.</p>
      </LegalSection>
    </LegalSheet>
  );
}
