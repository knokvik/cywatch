"""
Real-Time Log Stream with Live Model Visualizations
===================================================
One log at a time with animated model decision visualizations
"""

from flask import Flask, render_template, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
from datetime import datetime
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

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
df = pd.read_csv('server.csv')

# Preprocess
df_processed = df.copy()
cols_to_drop = ['timestamp', 'source_ip', 'session_id']
df_processed = df_processed.drop(columns=[col for col in cols_to_drop if col in df_processed.columns])

X = df_processed.drop('is_malicious', axis=1)
y = df_processed['is_malicious']

# Handle missing values
for col in X.columns:
    if X[col].isnull().sum() > 0:
        if X[col].dtype in ['float64', 'int64']:
            X[col].fillna(X[col].median(), inplace=True)
        else:
            X[col].fillna(X[col].mode()[0], inplace=True)

# Scale
X_scaled = scaler.transform(X)

print(f"✅ Loaded {len(X)} server logs")

# Initialize models
print("\n🤖 Training models...")

models = {
    'Decision Tree': DecisionTreeClassifier(max_depth=10, min_samples_split=20, min_samples_leaf=10, random_state=42),
    'KNN': KNeighborsClassifier(n_neighbors=5, weights='uniform', metric='euclidean'),
    'Random Forest': RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42),
    'SVM': SVC(kernel='rbf', probability=True, random_state=42)
}

for name, model in models.items():
    print(f"   Training {name}...")
    model.fit(X_scaled, y)

print("\n✅ All models ready!")

# Global state
current_log_index = 0
total_logs = len(X)
model_stats = {name: {'correct': 0, 'total': 0} for name in models.keys()}


@app.route('/')
def index():
    return render_template('dashboard.html')


@app.route('/api/next-log')
def next_log():
    """Get next single log with all model predictions"""
    global current_log_index
    
    log_data = X.iloc[current_log_index]
    actual_label = int(y.iloc[current_log_index])
    original_log = df.iloc[current_log_index]
    
    # Get raw log string (simulate real server log)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    
    # Make predictions with all models
    log_scaled = scaler.transform(log_data[feature_names].values.reshape(1, -1))
    predictions = {}
    
    for name, model in models.items():
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
        'request_count': float(log_data['request_count']),
        'request_rate': float(log_data['request_rate']),
        'auth_failure_rate': float(log_data['auth_failure_rate']),
        'burst_rate': float(log_data['burst_rate']),
        'status_4xx_count': float(log_data['status_4xx_count']),
        'suspicious_method_ratio': float(log_data['suspicious_method_ratio'])
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
    print("🚀 Real-Time Log Stream with Live Model Visualizations")
    print("="*70)
    print(f"📊 Dataset: {total_logs:,} logs")
    print(f"🤖 Models: {len(models)}")
    for name in models.keys():
        print(f"   - {name}")
    print(f"🌐 Open: http://localhost:5001")
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
