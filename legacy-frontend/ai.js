import { app } from "./firebase.js";

import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend
} from "@firebase/ai";

const ai = getAI(app, {
    backend: new GoogleAIBackend()
});

const model = getGenerativeModel(ai, {
    model: "gemini-3.5-flash"
});

export async function askAI(question, mode = "standard", onChunk) {
    let modeInstruction = "Teach Malaysian KSSM Chemistry clearly with step-by-step examples and SPM exam tips.";
    if (mode === "eli15") {
        modeInstruction = "Explain like I'm 15 years old! Use everyday real-life analogies, super simple language, and zero intimidating jargon.";
    } else if (mode === "bm") {
        modeInstruction = "Respond entirely in Bahasa Melayu according to the Malaysian KSSM Chemistry DSKP syllabus.";
    }

    const prompt = `
You are ChemLearn AI Tutor.
${modeInstruction}

Student Question:
${question}
`;

    if (onChunk) {
        const streamResult = await model.generateContentStream(prompt);
        let accumulatedText = "";
        for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            accumulatedText += chunkText;
            onChunk(chunkText, accumulatedText);
        }
        return accumulatedText;
    } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}