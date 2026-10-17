import { site } from "./site";

export const faqs: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Ordering & payment",
    items: [
      {
        q: "Why don't you take payment at checkout?",
        a: "Every order is reviewed by a florist before anything is charged. Within business hours we confirm the details by phone or email and send a secure payment link (all major cards, Apple Pay and Google Pay). Your order is scheduled as soon as payment is complete.",
      },
      {
        q: "How quickly will you confirm my order?",
        a: `Usually within 30–60 minutes during business hours (${site.hours[0].days}, ${site.hours[0].time} MT). Orders placed overnight are confirmed first thing the next morning.`,
      },
      {
        q: "Can I order for a future date?",
        a: "Yes — you can schedule delivery up to 120 days ahead. For Valentine's Day and Mother's Day we recommend ordering at least a week early.",
      },
      {
        q: "Do you charge sales tax?",
        a: "Sales tax is calculated based on the delivery address and shown on your secure payment link before you pay.",
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      {
        q: "Do you deliver same-day?",
        a: `Yes, in most metropolitan areas. Place your order by ${site.sameDayCutoff} in the recipient's time zone, Monday through Saturday, and we'll do our best to deliver that day. We'll tell you right away if same-day isn't possible for a particular address.`,
      },
      {
        q: "Where do you deliver?",
        a: "All 50 states and Washington, DC. Larger cities are served by our own studio or our vetted partner florists; for some rural addresses we may suggest next-day delivery.",
      },
      {
        q: "How much is delivery?",
        a: "Delivery is $15.99 per address and free on orders of $150 or more (before tax).",
      },
      {
        q: "What if the recipient isn't home?",
        a: "Our driver will call the recipient, then leave the flowers in a safe, shaded spot or with a neighbor or front desk where appropriate. If none of those is possible we'll contact you to reschedule at no additional cost.",
      },
    ],
  },
  {
    group: "Flowers & care",
    items: [
      {
        q: "Will my bouquet look exactly like the photo?",
        a: "It will have the same style, palette and value. Because we design with what's freshest that day, individual stems may vary slightly. If a key flower is unavailable we'll substitute something of equal or greater value and let you know.",
      },
      {
        q: "What is your 7-day freshness promise?",
        a: "Trim the stems, change the water every two days and keep flowers away from heat and fruit. If they don't last at least seven days, send us a photo within that week and we'll replace them or issue a credit.",
      },
      {
        q: "Can I request specific flowers or colors?",
        a: "Absolutely. Add a note for the florist when you order. For fully custom designs, contact us and we'll build something just for you.",
      },
    ],
  },
];
