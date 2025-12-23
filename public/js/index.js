document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const questionInput = document.getElementById('question');
    const sendBtn = document.getElementById('send-btn');
    const ingestBtn = document.getElementById('ingest-btn');
    const ingestStatus = document.getElementById('ingest-status');

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function ingestDocuments() {
        ingestBtn.disabled = true;
        ingestStatus.textContent = 'Processing PDFs...';

        try {
            const response = await fetch('/api/ingest', { method: 'POST' });
            const data = await response.json();
            ingestStatus.textContent = data.message || 'Ingestion complete!';
        } catch (error) {
            ingestStatus.textContent = 'Error: ' + error.message;
        } finally {
            ingestBtn.disabled = false;
        }
    }

    async function askQuestion() {
        const question = questionInput.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        questionInput.value = '';
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            const data = await response.json();
            addMessage(data.answer || 'No response', 'bot');
        } catch (error) {
            addMessage('Error: Could not reach server', 'bot');
        } finally {
            sendBtn.disabled = false;
            questionInput.focus();
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', askQuestion);
    ingestBtn.addEventListener('click', ingestDocuments);

    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    });

    // Focus input on load
    questionInput.focus();
});