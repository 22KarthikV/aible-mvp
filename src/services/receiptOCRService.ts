/**
 * Receipt OCR Service
 *
 * Integration with Google Gemini API (Multimodal) for intelligent receipt parsing.
 * Sends receipt images to Gemini 1.5 Flash to extract structured data (items, prices, dates).
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parsed receipt item
 */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category?: string;
}

/**
 * Parsed receipt data
 */
export interface ParsedReceipt {
  items: ReceiptItem[];
  totalAmount?: number;
  date?: string;
  storeName?: string;
  rawText?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Process receipt image using Google Gemini API
 *
 * @param imageData - Base64 encoded image
 * @returns Parsed receipt data
 */
export async function processReceiptImage(
  imageData: string
): Promise<{ data: ParsedReceipt | null; error: string | null }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        data: null,
        error:
          "Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.",
      };
    }

    // Clean base64 string (remove data:image/jpeg;base64, prefix if present)
    const base64Image = imageData.includes("base64,")
      ? imageData.split("base64,")[1]
      : imageData;

    // Determine mime type (default to jpeg, but try to detect)
    const mimeType = imageData.startsWith("data:image/png")
      ? "image/png"
      : "image/jpeg";

    // Construct the prompt
    const prompt = `
      Analyze this receipt image and extract the following information in strict JSON format:
      1. Store Name ("storeName")
      2. Date of purchase ("date") in YYYY-MM-DD format
      3. Total Amount ("totalAmount") as a number
      4. List of items ("items"), where each item has:
         - "name": clean product name
         - "quantity": number (default to 1 if not specified)
         - "price": number (unit price or total price for that line)
         - "unit": string (e.g., "kg", "lb", "piece")
         - "category": guess the category from this list: [fruits, vegetables, dairy, meat, seafood, bakery, beverages, snacks, pantry, other]

      Return ONLY the JSON object. Do not include markdown code blocks (like \`\`\`json). 
      If the image is not a receipt or unreadable, return: { "error": "Not a valid receipt" }
    `;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4, // Low temperature for more deterministic output
          response_mime_type: "application/json", // Enforce JSON response
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return {
        data: null,
        error: `Gemini API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();

    // Check if safety settings blocked the response
    if (result.promptFeedback?.blockReason) {
      return {
        data: null,
        error: `Request blocked: ${result.promptFeedback.blockReason}`,
      };
    }

    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return {
        data: null,
        error: "Empty response from AI",
      };
    }

    // Parse the JSON response
    try {
      // Clean up markdown code blocks if Gemini ignores the prompt instruction
      const cleanedText = textResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedData = JSON.parse(cleanedText);

      if (parsedData.error) {
        return { data: null, error: parsedData.error };
      }

      // Map to ParsedReceipt interface to ensure type safety
      const receipt: ParsedReceipt = {
        storeName: parsedData.storeName || "Unknown Store",
        date: parsedData.date || new Date().toISOString().split("T")[0],
        totalAmount:
          typeof parsedData.totalAmount === "number"
            ? parsedData.totalAmount
            : 0,
        items: Array.isArray(parsedData.items)
          ? parsedData.items.map(
              (item: {
                name?: string;
                quantity?: number;
                price?: number;
                unit?: string;
                category?: string;
              }) => ({
                name: item.name || "Unknown Item",
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || 0,
                unit: item.unit || "piece",
                category: item.category || "other",
              })
            )
          : [],
        rawText: "Processed by Gemini AI",
      };

      if (receipt.items.length === 0) {
        return { data: null, error: "No items found in receipt" };
      }

      return { data: receipt, error: null };
    } catch {
      console.error("Failed to parse AI response:", textResponse);
      return {
        data: null,
        error: "Failed to parse receipt data from AI response",
      };
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Convert image file to base64
 */
export async function imageFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
