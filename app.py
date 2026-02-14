from flask import Flask, render_template, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from datetime import datetime
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import csv
import os

app = Flask(__name__)
CORS(app)

# Load preprocessing objects
print("🔄 Loading preprocessing artifacts...")
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

with open('feature_names.pkl', 'rb') as f:
    feature_names = pickle.load(f)

# Load the dataset
print("📊 Loading server logs...")
data_records = []
try:
    csv_path = 'server_sample.csv'
    if not os.path.exists(csv_path):
        print(f"Warning: {csv_path} not found")
        # Fallback to server.csv if sample doesn't exist, but warn
        if os.path.exists('server.csv'):
            csv_path = 'server.csv'
    
    if os.path.exists(csv_path):
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data_records.append(row)
        print(f"✅ Loaded {len(data_records)} server logs from {csv_path}")
    else:
        print("❌ No CSV file found!")
except Exception as e:
    print(f"Error loading CSV: {e}")

# Prepare data for training
print("\n🤖 Training models...")
X_data = []
y_data = []

if feature_names:
    for row in data_records:
        try:
            features_row = []
            for feat in feature_names:
                val = row.get(feat, 0)
                try:
                    val = float(val) if val != '' else 0.0
                except ValueError:
                    val = 0.0
                features_row.append(val)
            
            label = int(row.get('is_malicious', 0))
            X_data.append(features_row)
            y_data.append(label)
        except Exception:
            continue

X = np.array(X_data)
y = np.array(y_data)

# Scale
if len(X) > 0 and scaler:
    X_scaled = scaler.transform(X)
else:
    X_scaled = np.array([])

# Initialize models
models = {
    'Decision Tree': DecisionTreeClassifier(max_depth=10, min_samples_split=20, min_samples_leaf=10, random_state=42),
    'KNN': KNeighborsClassifier(n_neighbors=5, weights='uniform', metric='euclidean'),
    'Random Forest': RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42),
    'SVM': SVC(kernel='rbf', probability=True, random_state=42)
}

if len(X_scaled) > 0:
    for name, model in models.items():
        print(f"   Training {name}...")
        model.fit(X_scaled, y)
    print("\n✅ All models ready!")
else:
    print("Warning: No data to train models!")

# Global state
current_log_index = 0
total_logs = len(data_records)
model_stats = {name: {'correct': 0, 'total': 0} for name in models.keys()}


@app.route('/')
def index():
    return render_template('dashboard.html')


@app.route('/api/next-log')
def next_log():
    """Get next single log with all model predictions"""
    global current_log_index
    
    if total_logs == 0:
        return jsonify({'error': 'No data'})

    raw_record = data_records[current_log_index]
    
    # Prepare features
    features_values = []
    if feature_names:
        for feat in feature_names:
            val = raw_record.get(feat, 0)
            try:
                val = float(val) if val != '' else 0.0
            except ValueError:
                val = 0.0
            features_values.append(val)
        
    actual_label = int(raw_record.get('is_malicious', 0))
    
    # Get raw log string (simulate real server log)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    
    # Make predictions with all models
    predictions = {}
    
    if scaler:
        log_scaled = scaler.transform(np.array(features_values).reshape(1, -1))
        
        for name, model in models.items():
            if hasattr(model, 'predict'):
                pred = model.predict(log_scaled)[0]
                proba = model.predict_proba(log_scaled)[0]
                
                predictions[name] = {
                    'prediction': int(pred),
                    'prediction_label': 'MALICIOUS' if pred == 1 else 'NORMAL',
                    'confidence': float(max(proba)),
                    'confidence_malicious': float(proba[1]),
                    'confidence_normal': float(proba[0]),
                    'is_correct': bool(pred == actual_label)
                }
                
                # Update stats
                model_stats[name]['total'] += 1
                if pred == actual_label:
                    model_stats[name]['correct'] += 1
    
    # Extract key features for visualization
    features = {
        'request_count': float(raw_record.get('request_count', 0)),
        'request_rate': float(raw_record.get('request_rate', 0)),
        'auth_failure_rate': float(raw_record.get('auth_failure_rate', 0)),
        'burst_rate': float(raw_record.get('burst_rate', 0)),
        'status_4xx_count': float(raw_record.get('status_4xx_count', 0)),
        'suspicious_method_ratio': float(raw_record.get('suspicious_method_ratio', 0))
    }
    
    # Create raw log message
    raw_log = f"[{timestamp}] IP: xxx.xxx.xxx.xxx | METHOD: POST /api/endpoint | STATUS: 200 | REQ_COUNT: {int(features['request_count'])} | RATE: {features['request_rate']:.2f}/s | AUTH_FAIL: {features['auth_failure_rate']:.2%} | BURST: {features['burst_rate']:.2f}"
    
    # Calculate overall stats
    stats = {}
    for name in models.keys():
        total = model_stats[name]['total']
        accuracy = round((model_stats[name]['correct'] / total * 100) if total > 0 else 0, 1)
        stats[name] = {
            'accuracy': accuracy,
            'total': total
        }
    
    response = {
        'log_index': current_log_index,
        'total_logs': total_logs,
        'timestamp': timestamp,
        'raw_log': raw_log,
        'actual_label': actual_label,
        'actual_label_name': 'MALICIOUS' if actual_label == 1 else 'NORMAL',
        'features': features,
        'predictions': predictions,
        'stats': stats
    }
    
    current_log_index = (current_log_index + 1) % total_logs
    
    return jsonify(response)


@app.route('/api/reset')
def reset():
    global current_log_index, model_stats
    current_log_index = 0
    model_stats = {name: {'correct': 0, 'total': 0} for name in models.keys()}
    return jsonify({'status': 'reset'})


if __name__ == '__main__':
    print("\n" + "="*70)
    print("⚡ CYWATCH AI - Enterprise Threat Detection System")
    print("="*70)
    print(f"📊 Dataset: {total_logs:,} server logs")
    print(f"🤖 Active Models: {len(models)}")
    for name in models.keys():
        print(f"   ✓ {name}")
    print(f"🌐 Dashboard: http://localhost:5001")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
