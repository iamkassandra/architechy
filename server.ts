
import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import Stripe from "stripe";
import { managePlatform } from "./services/adminAgentService.ts";

let stripeInstance: Stripe | null = null;
function getStripe() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is missing. Stripe functionality will be limited.");
    }
    stripeInstance = new Stripe(key || "sk_test_dummy");
  }
  return stripeInstance;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
// _storage removed as it was unused

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // THE MERCHANT: Stripe Stripe Checkout Bridge
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      const { productId, productName, price, email, userId } = req.body;
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: productName,
                description: `Digital License for ${productName}`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/shop`,
        metadata: {
          productId,
          userId: userId || "anonymous",
          email
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error) {
      console.error("Stripe failure:", error);
      res.status(500).json({ error: "Finance orchestration failure" });
    }
  });

  // THE AUDITOR: Stripe Webhook
  app.post("/api/webhooks/stripe", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripe = getStripe();
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string || "", process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err) {
      const error = err as Error;
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { productId, userId, email } = session.metadata || {};

      // 1. Record Purchase
      await db.collection("purchases").add({
        userId,
        email,
        productId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        status: "completed",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Fulfillment logic (Simulated Email/Download sync)
      await db.collection("fulfillment_logs").add({
        userId,
        email,
        productId,
        type: "EMAIL_DISPATCHED",
        message: `Order copy and access keys transmitted to ${email}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({received: true});
  });

  // THE DIAGNOSTIC: Systems Health Check
  app.get("/api/admin/diagnostics", async (req, res) => {
    res.json({
      stripe: !!process.env.STRIPE_SECRET_KEY,
      stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      gemini: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development'
    });
  });

  // THE ADMIN AGENT: Intelligence Node
  app.post("/api/admin/agent/command", async (req, res) => {
    try {
      const { command, userId } = req.body;
      
      // Verification: Check if user is admin
      const adminDoc = await db.collection("admins").doc(userId).get();
      if (!adminDoc.exists) return res.status(403).json({ error: "Access Denied" });

      // Record standard command
      const commandRef = await db.collection("admin_commands").add({
        userId,
        command,
        status: "executing",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // FIRE MISSION: Execute intelligence orchestration
      managePlatform(command, userId)
        .then(async (response) => {
          await commandRef.update({
            response,
            status: "completed",
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        })
        .catch(async (err) => {
          await commandRef.update({
            response: `ORCHESTRATION_FAILURE: ${err.message}`,
            status: "failed",
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });

      res.json({ commandId: commandRef.id, status: "Orchestration Initialized" });
    } catch (error) {
      console.error("Agent synchronization failure:", error);
      res.status(500).json({ error: "Agent synchronization failure" });
    }
  });

  // THE SCRIBE: Journal Publication Node
  app.post("/api/blog/publish", async (req, res) => {
    try {
      const { title, excerpt, content, category, level } = req.body;
      
      const postRef = await db.collection("blog").add({
        title,
        excerpt,
        content,
        category,
        level,
        author: "architech",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ id: postRef.id, status: "PUBLISHED" });
    } catch (error) {
      console.error("Scribe failure:", error);
      res.status(500).json({ error: "Scribe publishing failure" });
    }
  });

  // THE LIBRARIAN: Vault Asset Management
  app.post("/api/vault/assets", async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      
      const assetRef = await db.collection("assets").add({
        name,
        description,
        price: parseFloat(price),
        category,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ id: assetRef.id, status: "Vault Asset Created" });
    } catch (error) {
      console.error("Librarian failure:", error);
      res.status(500).json({ error: "Librarian orchestration failure" });
    }
  });

  // THE STEWARD: Identity Node Status
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderDoc = await db.collection("orders").doc(req.params.id).get();
      if (!orderDoc.exists) return res.status(404).json({ error: "Node not found" });
      res.json(orderDoc.data());
    } catch (error) {
      console.error("Steward connection failure:", error);
      res.status(500).json({ error: "Steward connection failure" });
    }
  });

  // THE INTELLIGENCE: Feed Fetcher
  app.get("/api/blog", async (req, res) => {
    try {
      const postsSnapshot = await db.collection("blog").orderBy("createdAt", "desc").get();
      const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(posts);
    } catch (error) {
      console.error("Intelligence sync failure:", error);
      res.status(500).json({ error: "Intelligence sync failure" });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
