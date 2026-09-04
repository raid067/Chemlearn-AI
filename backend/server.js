import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";

dotenv.config();

admin.initializeApp({
    projectId: "chemlearn-67"
});

const app = express();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: "Too many requests from this IP, please try again after a minute." }
});

app.use("/ask", apiLimiter);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
    res.send("ChemLearn AI Backend Running");
});

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying auth token", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
};

app.get("/api/secure-data", verifyToken, (req, res) => {
    res.json({ message: "Authenticated!", uid: req.user.uid });
});

app.post("/ask", async (req, res) => {

    console.log("=== /ask received ===");

    try {

        const question = req.body.question;

        console.log("Question:", question);


        if (!question || typeof question !== 'string') {
            return res.status(400).json({
                error: "Invalid or missing question"
            });
        }
        
        if (question.length > 500) {
            return res.status(400).json({
                error: "Question too long. Please limit to 500 characters."
            });
        }


        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content:
                    "You are ChemLearn AI, an expert tutor for Malaysian SPM Chemistry (Form 4 & Form 5 KSSM syllabus). Keep answers concise, clear, and structured with SPM exam tips, observations, and balanced chemical equations."
                },
                {
                    role: "user",
                    content: question
                }
            ]
        });


        console.log("OpenAI response received");


        res.json({

            answer: response.choices[0].message.content

        });


    } catch(error) {

        console.log("===== BACKEND ERROR =====");
        console.log(error.message);
        console.log(error);

        res.status(500).json({

            error: error.message

        });

    }

});

app.listen(3000, () => {
    console.log("🚀 ChemLearn AI running on http://localhost:3000");
});