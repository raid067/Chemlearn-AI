const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const STATS_DOC_PATH = 'system_stats/overview';

/**
 * onUserCreated
 * Triggered when a new user signs up.
 * Increments the `totalStudents` counter in `system_stats/overview` using a Transaction.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const statsRef = db.doc(STATS_DOC_PATH);

    try {
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef);
            
            if (!statsDoc.exists) {
                // Initialize the document if it doesn't exist
                transaction.set(statsRef, {
                    totalStudents: 1,
                    totalQuizzesCompleted: 0,
                    averageScore: 0,
                    _sumScores: 0 // hidden aggregate field for calculating average
                });
            } else {
                // Increment counter safely
                const currentTotal = statsDoc.data().totalStudents || 0;
                transaction.update(statsRef, {
                    totalStudents: currentTotal + 1
                });
            }
        });
        console.log(`Successfully incremented totalStudents for new user: ${user.uid}`);
    } catch (error) {
        console.error('Transaction failed onUserCreated:', error);
    }
});

/**
 * onQuizSubmitted
 * Triggered when a new document is created in `quiz_results`.
 * Recalculates `totalQuizzesCompleted` and `averageScore` safely within a Transaction.
 */
exports.onQuizSubmitted = functions.firestore
    .document('quiz_results/{resultId}')
    .onCreate(async (snap, context) => {
        const resultData = snap.data();
        const score = resultData.score;
        
        if (typeof score !== 'number') {
            console.warn('Quiz result missing valid score field. Ignoring.');
            return null;
        }

        const statsRef = db.doc(STATS_DOC_PATH);

        try {
            await db.runTransaction(async (transaction) => {
                const statsDoc = await transaction.get(statsRef);
                
                if (!statsDoc.exists) {
                    transaction.set(statsRef, {
                        totalStudents: 0,
                        totalQuizzesCompleted: 1,
                        averageScore: score,
                        _sumScores: score
                    });
                } else {
                    const data = statsDoc.data();
                    const currentTotalQuizzes = data.totalQuizzesCompleted || 0;
                    const currentSumScores = data._sumScores || 0;
                    
                    const newTotalQuizzes = currentTotalQuizzes + 1;
                    const newSumScores = currentSumScores + score;
                    const newAverageScore = newSumScores / newTotalQuizzes;

                    transaction.update(statsRef, {
                        totalQuizzesCompleted: newTotalQuizzes,
                        _sumScores: newSumScores,
                        averageScore: newAverageScore
                    });
                }
            });
            console.log(`Successfully updated quiz stats for resultId: ${context.params.resultId}`);
        } catch (error) {
            console.error('Transaction failed onQuizSubmitted:', error);
        }
    });
