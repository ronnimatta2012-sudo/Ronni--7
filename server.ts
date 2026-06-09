import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limit to handle base64 receipt images
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to high-quality simulated responses.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// ==================== API ROUTE: AI CATEGORIZATION ====================
app.post("/api/gemini/categorize", async (req, res) => {
  try {
    const { merchant, amount, notes } = req.body;
    if (!merchant) {
       return res.status(400).json({ error: "Merchant name is required" });
    }

    const client = getGeminiClient();
    if (!client) {
      // Fallback fallback rule
      const mockCategories = ["Food", "Groceries", "Rent", "Utilities", "Transportation", "Entertainment", "Shopping", "Healthcare", "Travel", "Subscriptions", "Other"];
      let category = "Other";
      const m = merchant.toLowerCase();
      if (m.includes("ola") || m.includes("uber") || m.includes("fuel") || m.includes("hp") || m.includes("metro")) category = "Transportation";
         else if (m.includes("netflix") || m.includes("spotify") || m.includes("jio") || m.includes("airtel") || m.includes("brand") || m.includes("sub")) category = "Subscriptions";
         else if (m.includes("bigbasket") || m.includes("blinkit") || m.includes("grocery") || m.includes("mart")) category = "Groceries";
         else if (m.includes("swiggy") || m.includes("zomato") || m.includes("restaurant") || m.includes("cafe") || m.includes("diner")) category = "Food";
         else if (m.includes("electric") || m.includes("power") || m.includes("water") || m.includes("bill")) category = "Utilities";
         else if (m.includes("steam") || m.includes("cinema") || m.includes("movie") || m.includes("theatre")) category = "Entertainment";
         else if (m.includes("reliance") || m.includes("nike") || m.includes("mall") || m.includes("clothing") || m.includes("amazon")) category = "Shopping";
         else if (m.includes("hospital") || m.includes("pharmacy") || m.includes("apollo") || m.includes("clinic")) category = "Healthcare";
         else if (m.includes("flight") || m.includes("hotel") || m.includes("indigo") || m.includes("rental")) category = "Travel";
      
      return res.json({ category, explanation: "AI categorized automatically using rules (key missing)." });
    }

    const prompt = `Categorize the following transaction:
Merchant: "${merchant}"
Amount: "${amount || "Unknown"}"
Notes: "${notes || "None"}"

Choose the single most appropriate category from this list:
Food, Groceries, Rent, Utilities, Transportation, Entertainment, Shopping, Healthcare, Travel, Education, Investments, Insurance, Subscriptions, Other.

Explain reasoning briefly in one sentence.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "The categorized department" },
            explanation: { type: Type.STRING, description: "Brief one-sentence reasoning" }
          },
          required: ["category", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("AI Categorization error:", error);
    res.status(500).json({ error: error.message || "Failed to categorize transaction" });
  }
});

// ==================== API ROUTE: RECEIPT SCANNER (OCR) ====================
app.post("/api/gemini/scan-receipt", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const client = getGeminiClient();
    if (!client) {
      // Return high-fidelity realistic OCR response for preview when no key exists
      return res.json({
        merchant: "BigBasket / Bandra",
        amount: 2285.00,
        tax: 110.00,
        date: new Date().toISOString().split("T")[0],
        category: "Groceries",
        items: [
          { name: "Organic Premium Rice 5kg", price: 650.00 },
          { name: "Fresh Organic Strawberries 250g", price: 180.00 },
          { name: "Organic Cow Ghee 1L", price: 750.00 },
          { name: "Whole Wheat Atta 5kg", price: 320.00 },
          { name: "Amul Butter 500g", price: 275.00 },
          { name: "GST / Tax (approx 5%)", price: 110.00 }
        ],
        confidenceScore: "High (Demo Mode)"
      });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: imageBase64
      }
    };

    const textPart = {
      text: `Analyze this receipt. Extract structural financial data including:
- Merchant Name (as accurate as possible, clean capitalization)
- Total Amount Paid (numeric value)
- Sales Tax Amount (numeric value, optional)
- Transaction Date (formatted as YYYY-MM-DD or current date if not found/unclear)
- Main category from list: Food, Groceries, Rent, Utilities, Transportation, Entertainment, Shopping, Healthcare, Travel, Education, Investments, Insurance, Subscriptions, Other.
- Individual line items (item description and price)

Ensure the output conforms exactly to the JSON schema specified.`
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: "Name of the store, business, or merchant" },
            amount: { type: Type.NUMBER, description: "Total amount on the receipt" },
            tax: { type: Type.NUMBER, description: "Calculated sales tax or GST, if present" },
            date: { type: Type.STRING, description: "Transaction date in standard YYYY-MM-DD format" },
            category: { type: Type.STRING, description: "Guessed best category from categories list" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Item description" },
                  price: { type: Type.NUMBER, description: "Cost of individual item" }
                },
                required: ["name", "price"]
              }
            }
          },
          required: ["merchant", "amount", "date", "category", "items"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("OCR scan receipt error:", error);
    res.status(500).json({ error: error.message || "Failed to scan receipt via Gemini AI OCR" });
  }
});

// ==================== API ROUTE: AI FINANCIAL COACH ====================
app.post("/api/gemini/coach", async (req, res) => {
  try {
    const { history, budgets, goals, message, userProfile } = req.body;

    const client = getGeminiClient();
    
    // Construct rich financial context
    const recentTxString = history && history.length > 0 
      ? history.slice(0, 20).map((t: any) => `- ${t.date} | ${t.merchant || "No Merchant"} | ${t.type === 'expense' ? '-' : '+'}${t.amount} [${t.category}]`).join("\n")
      : "No recent transactions found.";

    const budgetString = budgets && budgets.length > 0
      ? budgets.map((b: any) => `- ${b.category}: Limit ₹${b.limit} (Spent: ₹${b.spent || 0})`).join("\n")
      : "No customized budgets defined (using defaults).";

    const goalsString = goals && goals.length > 0
      ? goals.map((g: any) => `- ${g.name}: Target ₹${g.target} (Saved: ₹${g.current || 0}, Deadline: ${g.deadline || "None"})`).join("\n")
      : "No current financial savings goals tracked yet.";

    const baseCurrency = userProfile?.baseCurrency || "INR";

    const systemPrompt = `You are "Aura Coach", a premium elite AI Financial Coach, CFP (Certified Financial Planner), and personal wealth advisor.
Your tone is sophisticated, reassuring, expert, precise, and proactive.
You are helping a middle to high net worth user optimize their budgets, savings rate, and financial security.

Always format your response beautifully using elegant Markdown structure. Highlight anomalies, note subscription habits, recommend real steps for emergency savings, and compute calculations like:
- Savings rate (Income vs Expense)
- Burn rate/Runway
- Emergency Fund wellness score
- Actionable customized recommendations

Financial metrics summary coordinates:
Base Currency: ${baseCurrency}
User Profile: Goal is ${userProfile?.majorGoal || "financial health and balance"}.
Recent transactions (last 20):
${recentTxString}

Active Budget Caps:
${budgetString}

Savings & Financial Goals:
${goalsString}

Answer user questions comprehensively. When they ask general finance queries, ground them in their current metrics if logical. Suggest specific tweaks. Be critical of subscription creep and unused software suites, high dining ratios (over 15-20% of net cashflow), or sub-optimal savings rates (<20%). Make sure to sound like a elite $10M luxury fintech advisor.`;

    const instructions = message || "Please give me a comprehensive monthly financial performance review, audit my expenses, compute my financial health score, detect any anomalies, and deliver high-yield action recommendations.";

    if (!client) {
      // Simulate high-quality coach response when API key is missing
      return res.json({
        response: `### 🔱 Aura Executive Financial Audit

Hello! I have completed a rigorous review of your balance sheets, itemized cashflows, and active targets. Even in simulated review mode, here is your curated **Wealth Management Advisory**:

#### 1. Quick Coordinates & Health Score
*   **Aura Financial Health Score**: **82 / 100** (Solid, with strong potential)
*   **Active Savings Rate**: **~24.5%** of monthly revenue. Your trajectory is healthy, but we can unlock **₹15,000 - ₹20,000** in premium optimization.
*   **Cash Flow Liquidity**: Healthy positive margin. No debt threats detected in India-centric structures.

#### 2. Itemized Spending & Anomalies Audited
*   **Groceries & Convenience Creep**: Your BigBasket and Swiggy specialty dining receipts average **₹2,450 per ticket**. Consider consolidating core pantry purchases to boost your capital efficiency.
*   **Subscription Bloat**: We’ve identified **3 active, recurring digital premium tools** (Netflix India, Spotify, Jio Fibre) totaling **₹1,179/month**. Audit these to ensure full usage.
*   **Dining Leverage**: High frequency of restaurant orders (**Food: ₹10,850 total**). We recommend sliding your Food cap to save an additional ₹3,000 this week.

#### 3. Strategic Recommendations
*   **Emergency Runway Plan**: Your Emergency Reserve needs **₹5,00,000** for a full 6-m runway. You've currently achieved **75%** (₹3,85,000). Allocate **₹10,000/month of your salary** automatically via UPI Autopay to bridge this in less than 12 months.
*   **High-Yield Arbitrage**: Keep your reserves in a modern high-yield corporate FD (paying 7.5% interest) instead of traditional low-yield savings deposits.

*Ask me anything! For example, "How do I restructure my Food budget?" or "Analyze my BigBasket grocery receipt itemization."*`
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message ? [
        { text: `${systemPrompt}\n\nUser Question: ${message}` }
      ] : [
        { text: `${systemPrompt}\n\nExecute General Executive Report & Financial Audit.` }
      ]
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Financial Coach failure:", error);
    res.status(500).json({ error: error.message || "Failed to generate financial advice" });
  }
});


// ==================== VITE & STATIC FILES ROUTING ====================
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production mode, serving pre-built static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura Finance Server successfully connected to port ${PORT}`);
  });
}

setupServer();
