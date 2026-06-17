# ⚡ CyWatch AI

**Enterprise-Grade Multi-Model Threat Detection System**

Real-time server log analysis with 4 simultaneous machine learning models, providing comprehensive threat detection through diverse algorithmic approaches.

![CyWatch AI](https://img.shields.io/badge/CyWatch-AI-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge)
![ML Models](https://img.shields.io/badge/ML%20Models-4-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

---

## 🎯 Overview

CyWatch AI is a sophisticated real-time threat detection dashboard that simultaneously analyzes server logs using **4 different machine learning algorithms**. It provides live visualizations showing not just predictions, but **how each model thinks** and makes decisions.

### Key Features

✅ **Real-Time Log Streaming** - One log at a time, just like real servers  
✅ **4 ML Models Running Simultaneously** - Compare different approaches  
✅ **Live Data Visualizations** - See ALL processed logs as scatter plots  
✅ **Terminal-Style Interface** - Professional SOC dashboard aesthetics  
✅ **Dark/Light Mode** - Comfortable viewing in any environment  
✅ **Model Comparison Chart** - Real-time accuracy tracking  
✅ **No Scrolling Required** - Perfectly fitted UI design  

---

## 🤖 Machine Learning Models

| Model | Algorithm | Visualization | Best For |
|-------|-----------|--------------|----------|
| **🌳 Decision Tree** | Rule-based classification | Auth Fail vs Burst Rate scatter | Interpretable decision paths |
| **🎯 KNN** | K-Nearest Neighbors (k=5) | Request Rate vs 4xx Errors | Pattern similarity detection |
| **🌲 Random Forest** | Ensemble of 50 trees | Request Count vs Suspicious Methods | Robust predictions |
| **⚡ SVM** | Support Vector Machine (RBF kernel) | Auth Fail vs Request Rate with hyperplane | Complex boundary separation |

---

## 🏗️ Architecture

### Dashboard Layout (50/50 Split)

```
┌─────────────────────────────────────────────────────────────┐
│                    ⚡ CyWatch AI                         │
├──────────────────────────┬──────────────────────────────────┤
│   LEFT: Terminal Logs    │   RIGHT: Model Visualizations    │
│                          │                                  │
│  📡 Live Server Logs     │  🌳 Decision Tree  🎯 KNN       │
│  ┌───────────────────┐   │  [Scatter Plot]    [Scatter Plot]│
│  │ Log #123          │   │                                  │
│  │ MALICIOUS         │   │  🌲 Random Forest  ⚡ SVM        │
│  │ [timestamp...]    │   │  [Scatter Plot]    [Scatter Plot]│
│  └───────────────────┘   │                                  │
│  ┌───────────────────┐   │  📊 Model Comparison Chart       │
│  │ Log #122          │   │  [4-line real-time accuracy]     │
│  │ NORMAL            │   │                                  │
│  └───────────────────┘   │                                  │
│        ⋮                 │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Technology Stack

- **Backend**: Flask (Python)
- **ML Framework**: Scikit-learn
- **Visualization**: HTML5 Canvas (custom charts)
- **Styling**: Vanilla CSS with dark/light themes
- **Data Processing**: Pandas, NumPy

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd logs-prediction

# Install dependencies
pip install -r requirements.txt

# Ensure you have the required files
# - server.csv (training data)
# - scaler.pkl (preprocessing scaler)
# - feature_names.pkl (feature list)
```

### Running the Dashboard

```bash
# Start the server
python3 app.py

# Open your browser
# → http://localhost:5001
```

### First-Time Setup

1. **Train Models** (if needed):
   ```bash
   # Run the Jupyter notebook to train models
   jupyter notebook main.ipynb
   ```

2. **Start Dashboard**:
   - Click **"▶️ Start"** to begin log streaming
   - Watch logs appear in terminal on the left
   - See live predictions and visualizations on the right

3. **Controls**:
   - **⏸️ Pause** - Stop log stream
   - **🔄 Reset** - Clear all data and restart
   - **🌙/☀️** - Toggle dark/light mode

---

## 📊 What You'll See

### Left Panel: Terminal Log Stream

Real-time server logs appearing one-by-one:

```
Log #45                                             MALICIOUS
[2024-02-14 12:30:15.123] IP: xxx.xxx.xxx.xxx | METHOD: POST /api/endpoint | 
STATUS: 200 | REQ_COUNT: 156 | RATE: 45.23/s | AUTH_FAIL: 23.45% | BURST: 12.34
```

- **Color-coded borders**: 🟢 Green = Normal, 🔴 Red = Malicious
- **Scrolling history**: Last 100 logs visible
- **Real server format**: Timestamps, IPs, rates, errors

### Right Panel: Model Visualizations

**Each model shows**:
1. **Scatter Plot**: ALL processed logs plotted (not just current)
   - Green dots = Predicted Normal
   - Red dots = Predicted Malicious
   - X/Y axes = Different feature combinations per model
   
2. **Live Accuracy**: Real-time percentage
3. **Current Prediction**: Latest log's classification with ✓/✗

**Bottom Comparison Chart**:
- 4 colored lines tracking each model's accuracy over time
- Live legend showing which model is performing best

---

## 🎨 Visualizations Explained

### 🌳 Decision Tree
**Shows**: Auth Failure Rate vs Burst Rate  
**Why**: These features create clear decision boundaries  
**What to look for**: Clusters of red/green points

### 🎯 K-Nearest Neighbors
**Shows**: Request Rate vs 4xx Status Errors  
**Why**: Similar patterns group together  
**What to look for**: Neighborhood clustering

### 🌲 Random Forest
**Shows**: Request Count vs Suspicious Method Ratio  
**Why**: Ensemble considering volume + behavior  
**What to look for**: Distribution across feature space

### ⚡ Support Vector Machine
**Shows**: Auth Fail Rate vs Request Rate + Hyperplane  
**Why**: Optimal separation boundary  
**What to look for**: Blue diagonal line separating classes

---

## 📈 Understanding the Results

### Accuracy Metrics

Each model displays:
- **Accuracy %**: Percentage of correct predictions
- **Total Predictions**: Number of logs processed
- **Real-time updates**: Every new log updates the accuracy

### Prediction Results

- ✅ **Green + ✓**: Correct Normal prediction
- 🔴 **Red + ✓**: Correct Malicious prediction
- ✅ **Green + ✗**: Incorrect (predicted Normal, was Malicious)
- 🔴 **Red + ✗**: Incorrect (predicted Malicious, was Normal)

---

## 🔧 Configuration

### Speed Control

Edit `app.js`:
```javascript
this.speed = 1500; // Milliseconds per log (default: 1.5s)
```

### Model Parameters

Edit `app.py`:
```python
models = {
    'Decision Tree': {
        'model': DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=20,
            min_samples_leaf=10,
            random_state=42
        ),
        # ...
    },
    # Customize other models...
}
```

### Visualization Features

Edit `app.js` scatter plot functions to change:
- Which features are plotted (X/Y axes)
- Point sizes and colors
- Number of logs kept in memory

---

## 📁 Project Structure

```
logs-prediction/
├── app.py                    # Flask backend + ML models
├── main.ipynb                # Model training notebook
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── server.csv                # Server log dataset
├── scaler.pkl                # Trained scaler
├── feature_names.pkl         # Feature list
├── templates/
│   └── dashboard.html        # Main UI
└── static/
    ├── css/
    │   └── styles.css        # Dashboard styling
    └── js/
        └── app.js            # Frontend logic + visualizations
```

---

## 🎓 Educational Value

**Perfect for**:
- ✅ Learning how different ML algorithms work
- ✅ Understanding model comparison and evaluation
- ✅ Visualizing real-time data streaming
- ✅ Cybersecurity threat detection concepts
- ✅ Building production-ready dashboards

**Demonstrates**:
- Multiple model architectures simultaneously
- Real-time data processing and visualization
- Professional UI/UX design patterns
- Full-stack ML application development

---

## 🚨 Troubleshooting

### Models Not Loading

**Error**: `FileNotFoundError: scaler.pkl`  
**Solution**: Train models first using `main.ipynb`

### Port Already in Use

**Error**: `Address already in use: 5001`  
**Solution**: 
```bash
# Find and kill process
lsof -ti:5001 | xargs kill -9

# Or change port in app.py
app.run(port=5002)
```

### Scikit-learn Version Warnings

**Warning**: `InconsistentVersionWarning`  
**Solution**: Ensure consistent sklearn version
```bash
pip install scikit-learn==1.3.2
```

---

## 🎯 Future Enhancements

- [ ] Add more ML models (XGBoost, Neural Networks)
- [ ] Feature importance visualization
- [ ] Confusion matrix per model
- [ ] Export reports (PDF/CSV)
- [ ] Real-time alerts for high-risk logs
- [ ] Multi-user authentication
- [ ] Database integration for log persistence
- [ ] Custom model training via UI

---

## 📝 License

This project is open-source and available for educational and commercial use.

---

## 🙏 Acknowledgments

- Built with Flask, Scikit-learn, and HTML5 Canvas
- Inspired by enterprise SOC (Security Operations Center) dashboards
- Designed for both education and production use

---

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**⚡ CyWatch AI** - *Where Multiple Minds Protect Better Than One*

---

**Made with 🛡️ for cybersecurity professionals and ML enthusiasts**
