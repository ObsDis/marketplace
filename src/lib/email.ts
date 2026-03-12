// Email notifications via Resend (https://resend.com)
// Requires: RESEND_API_KEY environment variable
// Install: npm install resend

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Sprint Cargo <notifications@sprintcargo.com>";

// Brand colors & shared styles
const ORANGE = "#f97316";
const DARK = "#1a1a1a";
const GRAY = "#6b7280";

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:${ORANGE};padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Sprint Cargo</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:${GRAY};font-size:13px;">Sprint Cargo &mdash; Fast, reliable deliveries</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;color:${DARK};font-size:20px;font-weight:600;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${DARK};font-size:15px;line-height:1.6;">${text}</p>`;
}

function highlight(label: string, value: string): string {
  return `<p style="margin:0 0 8px;color:${DARK};font-size:15px;"><strong>${label}:</strong> ${value}</p>`;
}

// ─── Fire-and-forget send wrapper ─────────────────────────────

function send(to: string | string[], subject: string, html: string): void {
  resend.emails
    .send({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html })
    .catch((err) => {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    });
}

// ─── Notification functions ───────────────────────────────────

export function sendDeliveryPosted(
  customerEmail: string,
  deliveryTitle: string
): void {
  send(
    customerEmail,
    "Your delivery has been posted",
    layout(
      heading("Delivery Posted!") +
        paragraph(
          `Your delivery <strong>${deliveryTitle}</strong> is now live on Sprint Cargo. Drivers in your area will be able to see it and accept it.`
        ) +
        paragraph("We'll notify you as soon as a driver picks it up.")
    )
  );
}

export function sendDeliveryAccepted(
  customerEmail: string,
  driverName: string,
  deliveryTitle: string
): void {
  send(
    customerEmail,
    "A driver accepted your delivery",
    layout(
      heading("Driver Assigned!") +
        paragraph(
          `Great news! <strong>${driverName}</strong> has accepted your delivery <strong>${deliveryTitle}</strong>.`
        ) +
        paragraph(
          "Your driver will pick up the package soon. You'll receive updates as the delivery progresses."
        )
    )
  );
}

export function sendDeliveryPickedUp(
  customerEmail: string,
  deliveryTitle: string
): void {
  send(
    customerEmail,
    "Your package has been picked up",
    layout(
      heading("Package Picked Up!") +
        paragraph(
          `Your delivery <strong>${deliveryTitle}</strong> has been picked up and is on its way.`
        ) +
        paragraph("We'll let you know when it's delivered.")
    )
  );
}

export function sendDeliveryCompleted(
  customerEmail: string,
  driverEmail: string,
  deliveryTitle: string,
  price: number
): void {
  const formattedPrice = `$${price.toFixed(2)}`;

  // Email to the customer
  send(
    customerEmail,
    "Your delivery is complete",
    layout(
      heading("Delivery Complete!") +
        paragraph(
          `Your delivery <strong>${deliveryTitle}</strong> has been successfully delivered.`
        ) +
        highlight("Total", formattedPrice) +
        paragraph(
          "Thank you for using Sprint Cargo! If you have a moment, please leave a review for your driver."
        )
    )
  );

  // Email to the driver
  send(
    driverEmail,
    "Delivery completed — nice work!",
    layout(
      heading("Delivery Complete!") +
        paragraph(
          `You've successfully delivered <strong>${deliveryTitle}</strong>.`
        ) +
        highlight("Earnings", formattedPrice) +
        paragraph(
          "Payment will be transferred to your connected Stripe account. Great job!"
        )
    )
  );
}

export function sendDeliveryCancelled(
  customerEmail: string,
  deliveryTitle: string
): void {
  send(
    customerEmail,
    "Your delivery has been cancelled",
    layout(
      heading("Delivery Cancelled") +
        paragraph(
          `Your delivery <strong>${deliveryTitle}</strong> has been cancelled. If a payment was made, a refund will be processed shortly.`
        ) +
        paragraph(
          "If you didn't request this cancellation, please contact our support team."
        )
    )
  );
}

export function sendWelcomeEmail(email: string, name: string): void {
  send(
    email,
    "Welcome to Sprint Cargo!",
    layout(
      heading(`Welcome, ${name}!`) +
        paragraph(
          "Thanks for joining Sprint Cargo. We make local deliveries fast, easy, and reliable."
        ) +
        paragraph(
          "You can start posting deliveries right away, or browse available listings in your area."
        ) +
        paragraph("Happy shipping!")
    )
  );
}
