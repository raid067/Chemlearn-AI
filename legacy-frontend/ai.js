export async function askAI(question, mode = "standard", onChunk) {
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question, mode })
        });
        if (!response.ok) throw new Error(`AI Gateway error: ${response.status}`);
        const data = await response.json();
        const text = data.reply || data.text || data.message || '';
        if (onChunk && text) onChunk(text, text);
        return text;
    } catch (err) {
        console.warn("Direct server AI call failed, falling back:", err);
        return "Please connect to ChemLearn AI platform for interactive tutoring.";
    }
}