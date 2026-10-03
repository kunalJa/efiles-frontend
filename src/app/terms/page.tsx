import type { Metadata } from "next";
import Link from "next/link";
import LegalSheet, { LegalSection, SupportEmail } from "@/components/LegalSheet";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service, Refund & Return Policy, and Shipping Policy for E-Files.",
};

const caps = "font-bold uppercase tracking-wide text-[#32352e]";

export default function TermsPage() {
  return (
    <LegalSheet
      title="terms of service"
      summary={<>These Terms include our <a href="#refunds" className="underline">Refund &amp; Return Policy</a>, <a href="#refunds" className="underline">Limited Warranty</a>, and <a href="#shipping" className="underline">Shipping Policy</a>. <strong>All sales are final. We do not accept returns or exchanges.</strong> The only exceptions are orders we do not ship and shirts that arrive defective, misprinted, or damaged, as described below.</>}
    >
      <LegalSection id="agreement" title="1. agreement">
        <p>These Terms of Service (&ldquo;Terms&rdquo;) are a binding agreement between you and E-Files (&ldquo;E-Files,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), the operator of this website and seller of the merchandise offered on it. By accessing the website, placing an order, or completing checkout, you agree to these Terms and to our <Link href="/privacy" className="underline">Privacy Policy</Link>. If you do not agree, do not use the website or place an order.</p>
        <p>You must be at least 18 years old, or the age of majority where you live, and able to enter a binding contract to place an order. We sell only to customers with a shipping address in the United States.</p>
      </LegalSection>

      <LegalSection id="product" title="2. the product">
        <p>Each order is for one (1) white Gildan 5000 t-shirt, printed on demand, in the size you select (S, M, L, or XL). Prices are listed in U.S. dollars (USD): $44.00 for the shirt plus $4.95 for standard U.S. shipping, for a total of $48.95 USD. We do not currently charge sales tax. If taxes become applicable, they will be shown at checkout before you pay.</p>
        <p>After checkout, a document is assigned to your order at random from our inventory of publicly released U.S. government records related to Jeffrey Epstein. The front of the shirt displays an image of the first page of the assigned document. The back displays its file number. <strong>You cannot choose, preview, or exchange the assigned document.</strong> The identity of the document is not disclosed before delivery. Each document in our inventory is assigned to no more than one order.</p>
        <p><strong>Content notice:</strong> An assigned document may be mundane, such as an email, form, or court filing. It may also contain distressing subject matter, redactions, or the names or images of people who appear in the public record. By ordering, you acknowledge that you accept the document assigned to you, whatever its content.</p>
        <p>Product images on this website are illustrative. Colors, print placement, scale, and print clarity vary between digital screens and physical garments, and vary with the quality of the source document. These variations are expected and are not defects.</p>
      </LegalSection>

      <LegalSection id="public-record" title="3. artistic expression & public record">
        <p>All merchandise sold by E-Files is transformative artistic expression, political commentary, and historical documentation concerning a matter of significant public concern. Each design is based strictly on public records: the front of each shirt reproduces, without alteration of its substantive content, the first page of a document that was unsealed by a United States court or publicly released by an agency of the United States government, such as the U.S. Department of Justice. E-Files does not create, edit, or add to the words or images contained in those records. Works of the U.S. government are generally not subject to copyright protection (17 U.S.C. &sect; 105).</p>
        <p className={caps}>E-Files makes no independent factual allegations about any person. The appearance of any person&rsquo;s name, image, or likeness in a public record, and therefore on any merchandise, does not mean, suggest, or imply that the person committed any crime or wrongdoing, was involved with or knew of any unlawful conduct, or has been charged with or convicted of any offense.</p>
        <p>Documents are assigned at random, and we do not select any document because of who is named or pictured in it. Records reproduced on our merchandise may contain allegations, statements, or claims made by third parties. Those statements are the statements of their original authors, as they appear in the public record, and are not adopted, endorsed, or verified by E-Files. No merchandise reflects an endorsement by, sponsorship by, or affiliation with any person appearing in the records, or with the U.S. Department of Justice, any court, or any government agency.</p>
        <p>We are committed to protecting the privacy of survivors. If you believe a document in our inventory identifies a victim or survivor, contains non-public personal information, or should otherwise be removed, email <SupportEmail /> with the file number. We will review the request promptly and may withdraw any document from our inventory at our sole discretion.</p>
      </LegalSection>

      <LegalSection id="charity" title="4. charitable donations">
        <div className="border-2 border-[#32352e] bg-white/50 p-4">
          <p className={caps}>Independence notice: E-Files, its owners, and its operators are wholly independent. We are NOT affiliated with, endorsed by, sponsored by, or officially partnered with any charity or non-profit organization. No charity or non-profit organization has reviewed or approved this website, its merchandise, or these Terms.</p>
        </div>
        <p>We intend to donate one hundred percent (100%) of Net Profits to one or more non-profit organizations working to fight human trafficking, selected by us in our sole discretion. <strong>&ldquo;Net Profits&rdquo;</strong> means the gross revenue we actually receive from merchandise sales, less all of the following:</p>
        <ol className="list-[lower-alpha] space-y-2 pl-6">
          <li><strong>Cost of Goods Sold</strong>, including all Printful fulfillment, production, printing, blank garment, packaging, and shipping charges, and any costs of reprinting or reshipping;</li>
          <li><strong>Payment processing costs</strong>, including all Stripe transaction fees, refunds, chargebacks, dispute fees, and related charges;</li>
          <li><strong>Technical infrastructure costs</strong>, including all server, hosting, cloud computing, storage, database, domain, and software service costs required to operate this website and application, including costs charged by Vercel, Amazon Web Services, and Resend; and</li>
          <li>Any taxes, fees, or amounts we are legally required to pay or remit in connection with sales.</li>
        </ol>
        <p>If expenses equal or exceed revenue in any period, there are no Net Profits for that period. Donations are made at times and in amounts determined from our records. <strong>Purchases are not charitable contributions and are not tax-deductible.</strong> You are purchasing merchandise, not making a donation. If you want to support the fight against human trafficking, we encourage you to donate directly to a non-profit organization of your choice.</p>
      </LegalSection>

      <LegalSection id="orders" title="5. orders & payment">
        <p>Payments are processed by Stripe through its secure, PCI-compliant checkout. E-Files never receives or stores your full card number. When you submit an order, your payment method is authorized. The charge is captured once a document has been assigned and your order has been prepared for fulfillment. If your order cannot be prepared, the authorization is released or the charge is refunded.</p>
        <p>We may refuse or cancel any order at our discretion, including for suspected fraud, pricing or technical errors, inventory unavailability, or an unsupported shipping address. If we cancel an order after capturing payment, we will refund the full amount charged.</p>
      </LegalSection>

      <LegalSection id="refunds" title="6. refund & return policy">
        <p className={caps}>All sales are final. We do not accept returns or exchanges, and we do not give refunds, except in the two situations described in this section.</p>
        <p>Every shirt is printed on demand for your order and features a unique document assigned only to you. We do not accept returns or exchanges, and do not give refunds or replacements, for change of mind, dissatisfaction with the assigned document or its content, incorrect size selection, fit, or differences in color or print appearance between digital screens and physical garments. Those variations are expected and are not defects.</p>
        <p><strong>Exception 1: orders we do not ship.</strong> If we cancel your order, or it cannot be fulfilled and is never handed to the shipping carrier, we will refund the full amount charged to your original payment method. If your payment was only authorized and not yet captured, the authorization will be released and you will not be charged.</p>
        <p id="limited-warranty"><strong>Exception 2: 30-day Limited Warranty for defective, misprinted, or damaged shirts.</strong> E-Files warrants to the original purchaser that the shirt will arrive free from manufacturing defects, misprints, and damage that occurred before delivery. To make a claim, email <SupportEmail /> within thirty (30) days after the delivery date with your order reference, a description of the problem, and at least one clear photograph showing the entire affected shirt and the defect. Claims without photographs, or submitted after 30 days, will not be accepted. If we approve your claim, we will, at our option, send a replacement shirt at no cost to you or refund the amount you paid to your original payment method. You do not need to return the shirt unless we ask you to. Replacement shirts will display the document originally assigned to your order. This Limited Warranty does not cover color variations, fit, normal wear, damage from washing, drying, or use, or the content of the assigned document.</p>
        <p><strong>Cancellations.</strong> Because production begins immediately after checkout, you cannot cancel or modify an order once it has been placed.</p>
        <p><strong>Refund terms.</strong> Approved refunds are issued only to your original payment method; we do not issue cash, store credit, or gift cards. We do not charge restocking or other fees on approved refunds. Proof of purchase is your order reference or order confirmation. No merchandise is sold &ldquo;as is&rdquo; or as &ldquo;sale&rdquo; merchandise with different refund terms. Refund timing after approval depends on your bank or card issuer. You are entitled to a written copy of this refund policy upon request by emailing <SupportEmail />.</p>
        <p>This Limited Warranty gives you specific legal rights, and you may also have other rights which vary from state to state. Nothing in this policy limits any right you may have under applicable law that cannot be waived by contract. For order questions, email <SupportEmail /> with your order reference.</p>
      </LegalSection>

      <LegalSection id="shipping" title="7. shipping policy">
        <p>We ship only to addresses in the United States, by standard shipping, for a flat rate of $4.95 USD per order. Orders are fulfilled by our third-party print-on-demand partner, Printful.</p>
        <p><strong>Fulfillment time is separate from transit time.</strong> Fulfillment time is the time needed to print, prepare, and hand your order to the carrier. Transit time is the time the carrier takes to deliver it after that. We currently estimate delivery within 6 to 10 business days after checkout, including both. <strong>All dates are estimates, not guarantees.</strong> If we are unable to ship within the time stated at checkout, or within 30 days if no time is stated, we will notify you and give you the option to cancel for a full refund, as required by law.</p>
        <p><strong>Risk of loss.</strong> All shipments are made under a shipment contract. To the fullest extent permitted by law, title and risk of loss pass to you when your order is handed to the shipping carrier. E-Files is not responsible for, and you agree to hold E-Files harmless from, carrier delays and packages that are lost, stolen, or misdelivered after that time, including packages the carrier marks as delivered. If a package is lost in transit and never delivered, you may contact us within 30 days after the estimated delivery date; we may, at our sole discretion and without obligation, help pursue a carrier or fulfillment-partner claim or send a replacement. Shirts that arrive damaged are covered only by the Limited Warranty in the <a href="#refunds" className="underline">Refund &amp; Return Policy</a>.</p>
        <p><strong>Addresses.</strong> You are responsible for providing a complete and accurate shipping address. If a package is returned or undeliverable because of an invalid, incomplete, or incorrect address, or because it was refused or unclaimed, we will not issue a refund or free replacement. We may reship at your request only after you pay all reprinting and reshipping costs. Returned packages are held by our fulfillment partner for a limited time, generally 30 days, and may not be available for reshipment after that.</p>
        <p><strong>International customs.</strong> We do not ship outside the United States. If you forward or cause an order to be shipped internationally, you are solely responsible for all customs duties, import taxes, brokerage fees, and compliance with the laws of the destination country.</p>
      </LegalSection>

      <LegalSection id="use" title="8. use of the website">
        <p>You agree not to misuse the website, including by interfering with its operation, attempting to access non-public systems or data, submitting fraudulent orders, or using automated means to access it. The website&rsquo;s design, text, graphics, and code, excluding U.S. government records, are owned by E-Files and may not be copied without permission.</p>
      </LegalSection>

      <LegalSection id="warranty" title="9. disclaimer of warranties">
        <p className={caps}>To the fullest extent permitted by law, the website is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; with all faults and without warranties of any kind, whether express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.</p>
        <p className={caps}>The 30-day Limited Warranty in the Refund &amp; Return Policy is the only express warranty for merchandise. Any implied warranties for merchandise, including implied warranties of merchantability and fitness for a particular purpose, are limited in duration to thirty (30) days after delivery. Your only remedies are those stated in the Limited Warranty.</p>
        <p>Some states do not allow limitations on how long an implied warranty lasts, so the above limitation may not apply to you. E-Files does not warrant the accuracy, completeness, or truth of any content contained in any public record.</p>
      </LegalSection>

      <LegalSection id="liability" title="10. limitation of liability">
        <p className={caps}>To the fullest extent permitted by law, E-Files and its owners, operators, and service providers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any lost profits, data, or goodwill, arising out of or relating to the website, any merchandise, or these Terms. The total liability of E-Files for any claim will not exceed the purchase price you actually paid for the product giving rise to the claim.</p>
        <p>Some jurisdictions do not allow certain exclusions or limitations. In those jurisdictions, they apply to the maximum extent permitted.</p>
      </LegalSection>

      <LegalSection id="indemnity" title="11. indemnification">
        <p>You agree to indemnify and hold harmless E-Files and its owners and operators from any claims, losses, liabilities, and expenses, including reasonable attorneys&rsquo; fees, arising from your breach of these Terms, your misuse of the website, or your use or display of any merchandise in a manner that violates law or the rights of others.</p>
      </LegalSection>

      <LegalSection id="law" title="12. governing law">
        <p>These Terms are governed by the laws of the State of New York, without regard to its conflict-of-laws rules. You agree that any dispute arising out of or relating to these Terms, the website, or any merchandise will be brought exclusively in the state or federal courts located in New York County, New York, and you consent to their personal jurisdiction. Any claim must be brought individually, not as a plaintiff or class member in any class or representative proceeding, to the extent permitted by law.</p>
      </LegalSection>

      <LegalSection id="general" title="13. general">
        <p>We may update these Terms by posting a revised version with a new &ldquo;last updated&rdquo; date. The Terms in effect when you place an order apply to that order. If any provision is found unenforceable, it will be enforced to the maximum extent permitted and the remaining provisions will remain in effect. Our failure to enforce a provision is not a waiver. These Terms and our Privacy Policy are the entire agreement between you and E-Files regarding their subject matter.</p>
        <p>Contact: <SupportEmail />.</p>
      </LegalSection>
    </LegalSheet>
  );
}
