import { GoogleGenAI } from "@google/genai";

async function ocr() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const images = [
    { name: "checklist", url: "https://i.postimg.cc/nrD09gXf/DISPONIBILIDADE-SANTA-LUZIA-(ASSINARGR)-Check-list.jpg" },
    { name: "termo", url: "https://i.postimg.cc/BbKMPkjn/DISPONIBILIDADE-SANTA-LUZIA-(ASSINARGR)-Termo-Gr.jpg" }
  ];

  for (const img of images) {
    console.log(`--- Processing ${img.name} ---`);
    try {
      const response = await fetch(img.url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: "Extract all the text from this image as accurately as possible. Keep the original formatting and line breaks." },
            {
              inlineData: {
                data: base64,
                mimeType: "image/jpeg",
              },
            }
          ]
        }
      });
      console.log(res.text);
    } catch (error) {
      console.error(`Error processing ${img.name}:`, error);
    }
  }
}

ocr();
