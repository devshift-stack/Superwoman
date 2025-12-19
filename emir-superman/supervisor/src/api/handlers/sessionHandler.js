
const supervisor = require('../../supervisor');

async function handleChat(req, res) {
    const { sessionId } = req.params;
    const { message, userId } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    try {
        // Ensure the session exists
        let session = await supervisor.getSession(sessionId);
        if (!session) {
            // If the session doesn't exist, create a new one.
            // A more robust implementation might require authentication to associate the session with a user.
            session = await supervisor.createSession(userId || 'anonymous', { createdBy: 'handleChat' });
            // Note: The new sessionId is in session.id, but we are using the one from the URL for this request.
        }

        // Add a new task to the supervisor
        const taskId = await supervisor.addTask({
            type: 'answer-question',
            sessionId: session.id,
            data: {
                question: message
            }
        });

        // Wait for the task to complete and get the result
        const result = await supervisor.taskQueue.getTaskResult(taskId);

        if (result.error) {
            console.error(`Task ${taskId} resulted in an error:`, result.error);
            return res.status(500).json({ success: false, error: 'Task execution failed' });
        }

        res.json({ success: true, response: result, taskId: taskId });

    } catch (error) {
        console.error(`Error in handleChat for session ${sessionId}:`, error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

module.exports = { handleChat };
