import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency = "usd", metadata = {} } = req.body;

    if (!amount || amount < 50) {
      return res
        .status(400)
        .json({ error: "Amount must be at least 50 cents" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // in cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
