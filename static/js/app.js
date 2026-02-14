// CyWatch AI - Real-Time Threat Detection Dashboard

class CyWatchDashboard {
    constructor() {
        this.isPlaying = false;
        this.intervalId = null;
        this.speed = 1500;
        this.isDarkMode = false;
        this.maxLogs = 100;

        // Store all processed logs data for visualizations
        this.allLogsData = {
            'Decision Tree': [],
            'KNN': [],
            'Random Forest': [],
            'SVM': []
        };

        this.accuracyHistory = {
            'Decision Tree': [],
            'KNN': [],
            'Random Forest': [],
            'SVM': []
        };

        this.totalProcessed = 0;

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
        this.totalProcessedEl = document.getElementById('totalProcessed');

        this.accElements = {
            'Decision Tree': document.getElementById('dt-acc'),
            'KNN': document.getElementById('knn-acc'),
            'Random Forest': document.getElementById('rf-acc'),
            'SVM': document.getElementById('svm-acc')
        };

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
            'SVM': document.getElementById('svmCanvas').getContext('2d'),
            'comparison': document.getElementById('comparisonChart').getContext('2d')
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
        if (this.intervalId) clearInterval(this.intervalId);
    }

    async reset() {
        this.pause();
        try {
            await fetch('/api/reset');
            this.terminalBody.innerHTML = `
                <div class="terminal-welcome">
                    <pre>
╔══════════════════════════════════════════════════════════════════╗
║              CYWATCH AI - SECURITY MONITORING v3.0               ║
║   Advanced Multi-Model Threat Detection & Analysis System        ║
║   Press START to begin real-time log monitoring                  ║
╚══════════════════════════════════════════════════════════════════╝
                    </pre>
                </div>
            `;

            // Reset data
            this.allLogsData = {
                'Decision Tree': [],
                'KNN': [],
                'Random Forest': [],
                'SVM': []
            };
            this.accuracyHistory = {
                'Decision Tree': [],
                'KNN': [],
                'Random Forest': [],
                'SVM': []
            };
            this.totalProcessed = 0;
            this.totalProcessedEl.textContent = '0 logs processed';

            Object.values(this.accElements).forEach(el => el.textContent = '0%');
            Object.values(this.resultElements).forEach(el => {
                el.className = 'prediction-result';
                el.textContent = 'Waiting...';
            });

            // Redraw empty visualizations
            this.drawAllVisualizations();
        } catch (error) {
            console.error('Reset error:', error);
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.className = this.isDarkMode ? 'dark-mode' : 'light-mode';
        document.getElementById('themeIcon').textContent = this.isDarkMode ? '🌙' : '☀️';
        this.drawAllVisualizations();
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
        this.addLogToTerminal(data);
        this.totalProcessed++;
        this.totalProcessedEl.textContent = `${this.totalProcessed.toLocaleString()} logs processed`;

        // Store log data for visualizations
        const models = ['Decision Tree', 'KNN', 'Random Forest', 'SVM'];
        models.forEach(modelName => {
            const prediction = data.predictions[modelName];
            const stats = data.stats[modelName];

            // Store prediction with features
            this.allLogsData[modelName].push({
                features: data.features,
                prediction: prediction.prediction,
                actual: data.actual_label,
                confidence: prediction.confidence
            });

            // Keep last 200 logs for performance
            if (this.allLogsData[modelName].length > 200) {
                this.allLogsData[modelName].shift();
            }

            // Store accuracy
            this.accuracyHistory[modelName].push(stats.accuracy);
            if (this.accuracyHistory[modelName].length > 100) {
                this.accuracyHistory[modelName].shift();
            }

            // Update UI
            this.accElements[modelName].textContent = stats.accuracy + '%';

            const resultEl = this.resultElements[modelName];
            resultEl.className = `prediction-result ${prediction.prediction_label.toLowerCase()}`;
            const checkMark = prediction.is_correct ? '✓' : '✗';
            resultEl.textContent = `${prediction.prediction_label} ${checkMark} (${(prediction.confidence * 100).toFixed(0)}%)`;
        });

        // Redraw all visualizations
        this.drawAllVisualizations();
    }

    addLogToTerminal(data) {
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

        this.terminalBody.insertBefore(logEntry, this.terminalBody.firstChild);

        while (this.terminalBody.children.length > this.maxLogs) {
            this.terminalBody.removeChild(this.terminalBody.lastChild);
        }
    }

    drawAllVisualizations() {
        this.drawDecisionTreeScatter();
        this.drawKNNScatter();
        this.drawRandomForestScatter();
        this.drawSVMScatter();
        this.drawComparisonChart();
    }

    drawDecisionTreeScatter() {
        const ctx = this.canvases['Decision Tree'];
        const w = 380, h = 150;
        ctx.clearRect(0, 0, w, h);

        const data = this.allLogsData['Decision Tree'];
        if (data.length === 0) return this.drawPlaceholder(ctx, w, h, 'Awaiting data...');

        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            text: this.isDarkMode ? '#a0aec0' : '#4a5568'
        };

        // Draw scatter plot: Auth Failure Rate vs Burst Rate
        const padding = 30;
        const plotW = w - padding * 2;
        const plotH = h - padding * 2;

        // Axes
        ctx.strokeStyle = this.isDarkMode ? '#2d3748' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        // Plot points
        data.forEach(log => {
            const x = padding + (log.features.auth_failure_rate * plotW);
            const y = h - padding - (log.features.burst_rate / 50 * plotH);

            ctx.fillStyle = log.prediction === 1 ? colors.malicious : colors.normal;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Labels
        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Auth Fail Rate →', w / 2, h - 5);
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Burst Rate →', 0, 0);
        ctx.restore();
    }

    drawKNNScatter() {
        const ctx = this.canvases['KNN'];
        const w = 380, h = 150;
        ctx.clearRect(0, 0, w, h);

        const data = this.allLogsData['KNN'];
        if (data.length === 0) return this.drawPlaceholder(ctx, w, h, 'Awaiting data...');

        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            text: this.isDarkMode ? '#a0aec0' : '#4a5568'
        };

        const padding = 30;
        const plotW = w - padding * 2;
        const plotH = h - padding * 2;

        // Axes
        ctx.strokeStyle = this.isDarkMode ? '#2d3748' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        // Plot points
        data.forEach(log => {
            const x = padding + (log.features.request_rate / 100 * plotW);
            const y = h - padding - (log.features.status_4xx_count / 50 * plotH);

            ctx.fillStyle = log.prediction === 1 ? colors.malicious : colors.normal;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Labels
        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Request Rate →', w / 2, h - 5);
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('4xx Errors →', 0, 0);
        ctx.restore();
    }

    drawRandomForestScatter() {
        const ctx = this.canvases['Random Forest'];
        const w = 380, h = 150;
        ctx.clearRect(0, 0, w, h);

        const data = this.allLogsData['Random Forest'];
        if (data.length === 0) return this.drawPlaceholder(ctx, w, h, 'Awaiting data...');

        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            text: this.isDarkMode ? '#a0aec0' : '#4a5568'
        };

        const padding = 30;
        const plotW = w - padding * 2;
        const plotH = h - padding * 2;

        // Axes
        ctx.strokeStyle = this.isDarkMode ? '#2d3748' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        // Plot points
        data.forEach(log => {
            const x = padding + (log.features.request_count / 200 * plotW);
            const y = h - padding - (log.features.suspicious_method_ratio * plotH);

            ctx.fillStyle = log.prediction === 1 ? colors.malicious : colors.normal;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Labels
        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Request Count →', w / 2, h - 5);
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Suspicious Methods →', 0, 0);
        ctx.restore();
    }

    drawSVMScatter() {
        const ctx = this.canvases['SVM'];
        const w = 380, h = 150;
        ctx.clearRect(0, 0, w, h);

        const data = this.allLogsData['SVM'];
        if (data.length === 0) return this.drawPlaceholder(ctx, w, h, 'Awaiting data...');

        const colors = {
            normal: this.isDarkMode ? '#10b981' : '#059669',
            malicious: this.isDarkMode ? '#ef4444' : '#dc2626',
            line: this.isDarkMode ? '#6366f1' : '#4f46e5',
            text: this.isDarkMode ? '#a0aec0' : '#4a5568'
        };

        const padding = 30;
        const plotW = w - padding * 2;
        const plotH = h - padding * 2;

        // Draw hyperplane
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding + plotW * 0.3, padding);
        ctx.lineTo(w - padding, h - padding - plotH * 0.3);
        ctx.stroke();

        // Axes
        ctx.strokeStyle = this.isDarkMode ? '#2d3748' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        // Plot points
        data.forEach(log => {
            const x = padding + (log.features.auth_failure_rate * plotW);
            const y = h - padding - (log.features.request_rate / 100 * plotH);

            ctx.fillStyle = log.prediction === 1 ? colors.malicious : colors.normal;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Labels
        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Auth Fail Rate →', w / 2, h - 5);
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Request Rate →', 0, 0);
        ctx.restore();
    }

    drawComparisonChart() {
        const ctx = this.canvases['comparison'];
        const w = 800, h = 120;
        ctx.clearRect(0, 0, w, h);

        if (this.totalProcessed === 0) return this.drawPlaceholder(ctx, w, h, 'Start streaming to see model comparison...');

        const padding = 40;
        const plotW = w - padding * 2;
        const plotH = h - padding * 2;

        const colors = {
            'Decision Tree': '#10b981',
            'KNN': '#3b82f6',
            'Random Forest': '#8b5cf6',
            'SVM': '#f59e0b',
            axis: this.isDarkMode ? '#2d3748' : '#e2e8f0',
            text: this.isDarkMode ? '#6b7280' : '#94a3b8'
        };

        // Axes
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding);
        ctx.stroke();

        // Y-axis labels (0-100%)
        ctx.fillStyle = colors.text;
        ctx.font = '9px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 100; i += 25) {
            const y = h - padding - (plotH * i / 100);
            ctx.fillText(i + '%', padding - 5, y + 3);
        }

        // Draw lines for each model
        const models = ['Decision Tree', 'KNN', 'Random Forest', 'SVM'];
        models.forEach(modelName => {
            const history = this.accuracyHistory[modelName];
            if (history.length < 2) return;

            ctx.strokeStyle = colors[modelName];
            ctx.lineWidth = 2;
            ctx.beginPath();

            history.forEach((accuracy, idx) => {
                const x = padding + (plotW * idx / Math.max(history.length - 1, 1));
                const y = h - padding - (plotH * accuracy / 100);

                if (idx === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });

        // Legend
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        const legendY = 15;
        models.forEach((modelName, idx) => {
            const x = padding + idx * 150;
            ctx.fillStyle = colors[modelName];
            ctx.fillRect(x, legendY - 6, 10, 10);
            ctx.fillStyle = this.isDarkMode ? '#a0aec0' : '#4a5568';
            ctx.fillText(modelName, x + 15, legendY + 3);
        });
    }

    drawPlaceholder(ctx, w, h, text) {
        ctx.fillStyle = this.isDarkMode ? '#6b7280' : '#94a3b8';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(text, w / 2, h / 2);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ CyWatch AI Initialized');
    const dashboard = new CyWatchDashboard();
    window.dashboard = dashboard;
});
