# 🛡️ Live Server Log Prediction Dashboard

A real-time web-based dashboard for detecting malicious server logs using Machine Learning.

## 🚀 Features

- **Live Log Streaming** - Automatically cycles through server logs
- **Real-time Predictions** - Instant malicious/normal classification
- **Multi-Panel Dashboard** - 5 visualization panels:
  1. 📊 Live log stream display
  2. 🎯 Prediction results with confidence scores
  3. 📈 Confidence breakdown (Normal vs Malicious)
  4. 📊 Session statistics (total, accuracy, counts)
  5. 🕐 Recent activity feed
- **Beautiful UI** - Modern dark theme with smooth animations
- **No Input Required** - Fully automated live streaming
- **Model Performance** - Decision Tree classifier with 24 features

## 📁 Project Structure

```
logs-prediction/
├── app.py                      # Flask backend server
├── templates/
│   └── dashboard.html          # Main dashboard HTML
├── static/
│   ├── css/
│   │   └── styles.css          # Modern styling
│   └── js/
│       └── app.js              # Frontend JavaScript
├── main.ipynb                  # Model training notebook
├── best_model.pkl              # Trained Decision Tree model
├── scaler.pkl                  # StandardScaler for preprocessing
├── feature_names.pkl           # Feature name mappings
├── server.csv                  # Server logs dataset
└── requirements.txt            # Python dependencies
```

## 🔧 Installation

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Model Files

Make sure these files exist (created from the Jupyter notebook):
- `best_model.pkl`
- `scaler.pkl`
- `feature_names.pkl`
- `server.csv`

## 🎮 Usage

### 1. Start the Flask Server

```bash
python app.py
```

You should see:
```
🚀 Live Log Prediction Dashboard Starting...
📊 Dataset: 100,000 logs
🤖 Model: DecisionTreeClassifier
🌐 Open: http://localhost:5000
```

### 2. Open the Dashboard

Open your browser and navigate to:
```
http://localhost:5000
```

### 3. Control the Dashboard

- **▶️ Start/Resume** - Begin live log streaming
- **⏸️ Pause** - Pause the stream
- **🔄 Reset** - Reset statistics and start from log #1
- **Speed Slider** - Adjust streaming speed (0.1s - 2.0s per log)

## 📊 Dashboard Panels Explained

### Panel 1: Live Log Stream
Shows the current log being analyzed with 6 key features:
- Request Count
- Request Rate
- Burst Rate
- Auth Failure Rate
- 4xx Status Count
- Suspicious Method Ratio

### Panel 2: Prediction Result
Displays:
- **Prediction**: MALICIOUS or NORMAL (large, colored)
- **Confidence**: Percentage confidence of the prediction
- **Actual**: The true label from the dataset
- **Match Indicator**: ✅ if correct, ❌ if incorrect

### Panel 3: Confidence Breakdown
Two progress bars showing:
- ✅ Normal confidence (%)
- ⚠️ Malicious confidence (%)
- Overall confidence gauge

### Panel 4: Session Statistics
Four stat cards tracking:
- 📝 Total logs processed
- ⚠️ Malicious logs detected
- ✅ Normal logs detected
- 🎯 Model accuracy (last 100 predictions)

### Panel 5: Recent Activity
Scrollable feed of the last 20 predictions showing:
- Timestamp
- Prediction (Malicious/Normal)
- Log number
- Confidence score
- Correctness indicator

## 🤖 How It Works

1. **Backend (Flask)**
   - Loads trained ML model (`best_model.pkl`)
   - Cycles through `server.csv` logs (1 → 1000 → 1 → ...)
   - Preprocesses each log (feature selection, scaling)
   - Makes real-time predictions
   - Sends results to frontend via API

2. **Frontend (JavaScript)**
   - Fetches next log prediction from `/api/next-log`
   - Updates all 5 panels with smooth animations
   - Tracks statistics and accuracy
   - Maintains recent activity feed
   - Handles play/pause/reset controls

3. **Model**
   - **Algorithm**: Decision Tree Classifier
   - **Features**: 24 engineered features
   - **Training**: 80/20 train-test split
   - **Validation**: 5-fold cross-validation
   - **Accuracy**: High accuracy on test set

## 🎨 UI Features

- **Modern Dark Theme** - Easy on the eyes for long monitoring sessions
- **Smooth Animations** - Value changes animate for better visibility
- **Color Coding**:
  - 🟢 Green = Normal/Safe
  - 🔴 Red = Malicious/Threat
  - 🔵 Blue = Neutral/Info
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live streaming with configurable speed

## 🔥 API Endpoints

### GET `/`
Returns the main dashboard HTML page

### GET `/api/next-log`
Returns next log and prediction:
```json
{
  "log_index": 42,
  "total_logs": 100000,
  "timestamp": "11:30:45.123",
  "prediction": {
    "prediction": 1,
    "prediction_label": "Malicious",
    "confidence_normal": 0.15,
    "confidence_malicious": 0.85,
    "confidence_score": 0.85
  },
  "actual_label": 1,
  "is_correct": true,
  "log_sample": { ... },
  "stats": { ... }
}
```

### GET `/api/stats`
Returns overall session statistics

### GET `/api/reset`
Resets log counter and statistics

## 🎯 Use Cases

- **Security Operations Center (SOC)** - Real-time threat monitoring
- **Educational Demos** - Teaching ML in cybersecurity
- **Model Validation** - Visual verification of model performance
- **Penetration Testing** - Analyzing attack patterns
- **Research** - Studying malicious behavior patterns

## ⚙️ Configuration

Modify in `app.py`:
- `port=5000` - Change server port
- `debug=True` - Toggle debug mode
- `host='0.0.0.0'` - Allow external connections

Modify in `app.js`:
- `this.speed = 1000` - Default streaming speed (ms)
- `this.maxActivityItems = 20` - Activity history size

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in app.py or kill existing process
lsof -ti:5000 | xargs kill -9
```

**Model files missing:**
```bash
# Run the Jupyter notebook to generate model files
jupyter notebook main.ipynb
# Execute all cells to train and save the model
```

**Dependencies error:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 📈 Future Enhancements

- [ ] Multiple model comparison (KNN vs Decision Tree)
- [ ] Real-time log upload feature
- [ ] Export predictions to CSV
- [ ] Email alerts for high-threat logs
- [ ] Historical trend charts
- [ ] User authentication
- [ ] Database integration for persistence

## 📝 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

Built with ❤️ using Flask, scikit-learn, and modern web technologies.

---

**Enjoy monitoring your server logs in real-time! 🚀**
