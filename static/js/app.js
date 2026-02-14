// Real-Time Log Stream Dashboard with Live Model Visualizations

class LogStreamDashboard {
    constructor() {
        this.isPlaying = false;
        this.intervalId = null;
        this.speed = 1500; // 1.5 seconds per log
        this.isDarkMode = true;
        this.maxLogs = 100; // Keep last 100 logs in terminal

        this.initializeElements();
        this.attachEventListeners();
        this.initializeCanvases();
    }

    initializeElements() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.terminalBody = document.getElementById('terminalBody');
        this.streamStatus = document.getElementById('streamStatus');

        // Accuracy elements
        this.accElements = {
            'Decision Tree': document.getElementById('dt-acc'),
            'KNN': document.getElementById('knn-acc'),
            'Random Forest': document.getElementById('rf-acc'),
            'SVM': document.getElementById('svm-acc')
        };

        // Result elements
        this.resultElements = {
            'Decision Tree': document.getElementById('dt-result'),
            'KNN': document.getElementById('knn-result'),
            'Random Forest': document.getElementById('rf-result'),
            'SVM': document.getElementById('svm-result')
        };
    }

    attachEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    initializeCanvases() {
        this.canvases = {
            'Decision Tree': document.getElementById('dtCanvas').getContext('2d'),
            'KNN': document.getElementById('knnCanvas').getContext('2d'),
            'Random Forest': document.getElementById('rfCanvas').getContext('2d'),
            'SVM': document.getElementById('svmCanvas').getContext('2d')
        };
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playPauseBtn.textContent = '⏸️ Pause';
        this.playPauseBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        this.streamStatus.textContent = 'STREAMING';
        this.fetchNextLog();
        this.intervalId = setInterval(() => this.fetchNextLog(), this.speed);
    }

    pause() {
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️ Resume';
        this.playPauseBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        this.streamStatus.textContent = 'PAUSED';
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    async reset() {
        this.pause();
        try {
            await fetch('/api/reset');
            this.terminalBody.innerHTML = `
                <div class="terminal-welcome">
                    <pre>
╔══════════════════════════════════════════════════════════════════╗
║   SECURE LOG MONITORING SYSTEM v2.0                              ║
║   System reset successfully                                       ║
║   Press START to begin real-time analysis                        ║
╚══════════════════════════════════════════════════════════════════╝
                    </pre>
                </div>
            `;

            // Reset all accuracies
            Object.values(this.accElements).forEach(el => el.textContent = '0%');
            Object.values(this.resultElements).forEach(el => {
                el.className = 'prediction-result';
                el.innerHTML = '<span class="pred-label">Waiting...</span>';
            });
        } catch (error) {
            console.error('Reset error:', error);
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.className = this.isDarkMode ? 'dark-mode' : 'light-mode';
        document.getElementById('themeIcon').textContent = this.isDarkMode ? '🌙' : '☀️';
    }

    async fetchNextLog() {
        try {
            const response = await fetch('/api/next-log');
            const data = await response.json();
            this.processLog(data);
        } catch (error) {
            console.error('Fetch error:', error);
            this.pause();
        }
    }

    processLog(data) {
        // Add log to terminal
        this.addLogToTerminal(data);

        // Update model visualizations
        this.updateModels(data);
    }

    addLogToTerminal(data) {
        // Remove welcome message if present
        const welcome = this.terminalBody.querySelector('.terminal-welcome');
        if (welcome) welcome.remove();

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${data.actual_label_name.toLowerCase()}`;

        logEntry.innerHTML = `
            <div class="log-header">
                <span class="log-index">Log #${data.log_index}</span>
                <span class="log-actual-badge badge-${data.actual_label_name.toLowerCase()}">
                    ${data.actual_label_name}
                </span>
            </div>
            <div class="log-raw">${data.raw_log}</div>
        `;

        // Add to top of terminal
        this.terminalBody.insertBefore(logEntry, this.terminalBody.firstChild);

        // Limit number of logs
        while (this.terminalBody.children.length > this.maxLogs) {
            this.terminalBody.removeChild(this.terminalBody.lastChild);
        }
    }

    updateModels(data) {
        const models = ['Decision Tree', 'KNN', 'Random Forest', 'SVM'];

        models.forEach(modelName => {
            const prediction = data.predictions[modelName];
            const stats = data.stats[modelName];

            // Update accuracy
            this.accElements[modelName].textContent = stats.accuracy + '%';

            // Update prediction result
            const resultEl = this.resultElements[modelName];
            resultEl.className = `prediction-result ${prediction.prediction_label.toLowerCase()}`;

            const checkMark = prediction.is_correct ? '✓' : '✗';
            resultEl.innerHTML = `
                <span class="pred-label">${prediction.prediction_label} ${checkMark}</span>
                <span class="confidence-text">${(prediction.confidence * 100).toFixed(1)}% confidence</span>
            `;

            // Draw visualization
            this.drawVisualization(modelName, prediction, data.features);
        });
    }

    drawVisualization(modelName, prediction, features) {
        const ctx = this.canvases[modelName];
        const width = 400;
        const height = 180;

        ctx.clearRect(0, 0, width, height);

        switch (modelName) {
            case 'Decision Tree':
                this.drawDecisionTree(ctx, prediction, features, width, height);
                break;
            case 'KNN':
                this.drawKNN(ctx, prediction, features, width, height);
                break;
            case 'Random Forest':
                this.drawRandomForest(ctx, prediction, features, width, height);
                break;
            case 'SVM':
                this.drawSVM(ctx, prediction, features, width, height);
                break;
        }
    }

    drawDecisionTree(ctx, prediction, features, w, h) {
        // Draw tree structure
        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            neutral: this.isDarkMode ? '#6b7280' : '#94a3b8'
        };

        // Root node
        ctx.fillStyle = colors.neutral;
        ctx.fillRect(w / 2 - 40, 20, 80, 30);
        ctx.fillStyle = this.isDarkMode ? '#e6e6e6' : '#1a202c';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Auth Fail?', w / 2, 38);

        // Branches
        ctx.strokeStyle = colors.neutral;
        ctx.lineWidth = 2;

        // Left branch (low auth fail)
        ctx.beginPath();
        ctx.moveTo(w / 2 - 40, 50);
        ctx.lineTo(w / 4, 80);
        ctx.stroke();

        // Right branch (high auth fail)
        ctx.beginPath();
        ctx.moveTo(w / 2 + 40, 50);
        ctx.lineTo(w * 3 / 4, 80);
        ctx.stroke();

        // Left node (Normal)
        const leftColor = features.auth_failure_rate < 0.5 && prediction.prediction === 0 ? colors.normal : colors.neutral;
        ctx.fillStyle = leftColor;
        ctx.fillRect(w / 4 - 30, 80, 60, 30);
        ctx.fillStyle = this.isDarkMode ? '#e6e6e6' : '#1a202c';
        ctx.fillText('NORMAL', w / 4, 98);

        // Right node (check burst)
        ctx.fillStyle = colors.neutral;
        ctx.fillRect(w * 3 / 4 - 40, 80, 80, 30);
        ctx.fillText('Burst Rate?', w * 3 / 4, 98);

        // Right branches
        ctx.beginPath();
        ctx.moveTo(w * 3 / 4 - 30, 110);
        ctx.lineTo(w * 3 / 4 - 50, 140);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * 3 / 4 + 30, 110);
        ctx.lineTo(w * 3 / 4 + 50, 140);
        ctx.stroke();

        // Final nodes
        const finalColor = prediction.prediction === 1 ? colors.malicious : colors.normal;
        ctx.fillStyle = finalColor;
        ctx.fillRect(w * 3 / 4 - 80, 140, 60, 30);
        ctx.fillText('NORMAL', w * 3 / 4 - 50, 158);

        ctx.fillRect(w * 3 / 4 + 20, 140, 80, 30);
        ctx.fillText('MALICIOUS', w * 3 / 4 + 60, 158);

        // Highlight active path
        if (prediction.prediction === 1) {
            ctx.strokeStyle = colors.malicious;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(w * 3 / 4 + 20, 140, 80, 30);
            ctx.setLineDash([]);
        }
    }

    drawKNN(ctx, prediction, features, w, h) {
        // Draw K nearest neighbors visualization
        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            current: this.isDarkMode ? '#6366f1' : '#4f46e5'
        };

        // Center point (current log)
        const centerX = w / 2;
        const centerY = h / 2;

        // Draw neighbors (5 points)
        const neighbors = [
            { x: -50, y: -30, type: 0 },
            { x: -30, y: 40, type: 0 },
            { x: 30, y: -40, type: 1 },
            { x: 50, y: 20, type: 1 },
            { x: 20, y: 50, type: prediction.prediction }
        ];

        neighbors.forEach(n => {
            // Draw line to neighbor
            ctx.strokeStyle = this.isDarkMode ? '#2d3748' : '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + n.x, centerY + n.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw neighbor point
            ctx.fillStyle = n.type === 1 ? colors.malicious : colors.normal;
            ctx.beginPath();
            ctx.arc(centerX + n.x, centerY + n.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw current point (larger)
        ctx.strokeStyle = colors.current;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = this.isDarkMode ? '#1a1f3a' : '#ffffff';
        ctx.fill();

        // Labels
        ctx.fillStyle = this.isDarkMode ? '#a0aec0' : '#4a5568';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Current Log', centerX, h - 10);

        // Vote count
        const normalCount = neighbors.filter(n => n.type === 0).length;
        const maliciousCount = neighbors.filter(n => n.type === 1).length;

        ctx.fillText(`Normal: ${normalCount}  Malicious: ${maliciousCount}`, centerX, 20);
    }

    drawRandomForest(ctx, prediction, features, w, h) {
        // Draw multiple small trees voting
        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            tree: this.isDarkMode ? '#6b7280' : '#94a3b8'
        };

        const treeCount = 5;
        const treeWidth = (w - 40) / treeCount;

        for (let i = 0; i < treeCount; i++) {
            const x = 20 + i * treeWidth + treeWidth / 2;

            // Each tree votes (randomize for demo)
            const vote = Math.random() > 0.5 ? 1 : 0;
            const voteColor = vote === 1 ? colors.malicious : colors.normal;

            // Draw mini tree
            ctx.fillStyle = colors.tree;
            ctx.beginPath();
            ctx.moveTo(x, 60);
            ctx.lineTo(x - 15, 90);
            ctx.lineTo(x + 15, 90);
            ctx.closePath();
            ctx.fill();

            ctx.fillRect(x - 5, 90, 10, 20);

            // Vote indicator
            ctx.fillStyle = voteColor;
            ctx.beginPath();
            ctx.arc(x, 130, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Final prediction
        ctx.fillStyle = prediction.prediction === 1 ? colors.malicious : colors.normal;
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Final: ' + prediction.prediction_label, w / 2, h - 15);
    }

    drawSVM(ctx, prediction, features, w, h) {
        // Draw hyperplane separation
        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            line: this.isDarkMode ? '#6366f1' : '#4f46e5'
        };

        // Draw hyperplane (diagonal line)
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(w - 50, h - 50);
        ctx.stroke();

        // Draw margin lines
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(30, 50);
        ctx.lineTo(w - 70, h - 50);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(70, 50);
        ctx.lineTo(w - 30, h - 50);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scatter some points
        // Normal side (upper left)
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = colors.normal;
            ctx.beginPath();
            ctx.arc(
                20 + Math.random() * (w / 3),
                20 + Math.random() * (h / 3),
                5, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Malicious side (lower right)
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = colors.malicious;
            ctx.beginPath();
            ctx.arc(
                w * 2 / 3 + Math.random() * (w / 3 - 20),
                h * 2 / 3 + Math.random() * (h / 3 - 20),
                5, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Current point
        const currentSide = prediction.prediction === 1 ? 'lower' : 'upper';
        const currentX = prediction.prediction === 1 ? w * 3 / 4 : w / 4;
        const currentY = prediction.prediction === 1 ? h * 3 / 4 : h / 4;

        ctx.strokeStyle = this.isDarkMode ? '#ffffff' : '#000000';
        ctx.lineWidth = 2;
        ctx.fillStyle = prediction.prediction === 1 ? colors.malicious : colors.normal;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Real-Time Log Stream Dashboard Initialized');
    const dashboard = new LogStreamDashboard();
    window.dashboard = dashboard;
});
