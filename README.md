# Bitcoin AI Trading Platform 🚀

A professional TradingView-style web application for Bitcoin trading with AI-powered price predictions using LSTM neural networks.

## Features

- **Live TradingView Charts** - Professional candlestick charts with real-time Bitcoin data
- **AI Price Predictions** - 24-hour Bitcoin price forecasts using LSTM model trained on 10+ years of data
- **Trading Interface** - Buy/sell panel with market and limit order types
- **Dark Theme** - Professional TradingView-inspired design
- **Real-time Metrics** - Model confidence, accuracy, and performance indicators

## Tech Stack

### Frontend
- **React** + **Vite** - Fast, modern frontend framework
- **TradingView Widget** - Professional charting library
- **Axios** - API communication
- **Lucide React** - Modern icon library

### Backend
- **Flask** - Python web framework
- **TensorFlow/Keras** - LSTM model for predictions
- **Pandas** - Data processing
- **NumPy** - Numerical computations

## Project Structure

```
TradingProject/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── TradingViewChart.jsx
│   │   │   ├── PredictionPanel.jsx
│   │   │   └── TradingPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── data/                   # Bitcoin historical data
│   └── BTC_USD.csv
├── models/                 # Trained ML models
│   ├── bitcoin_lstm_model.h5
│   └── scaler.pkl
├── api_server.py          # Flask backend API
├── data_engine.py         # Data collection script
├── train_model.ipynb      # Model training notebook
└── requirements.txt       # Python dependencies
```

## Getting Started

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Train the Model (if not already trained)

Open `train_model.ipynb` in Jupyter and run all cells to train the LSTM model.

### 4. Start the Backend API

```bash
python api_server.py
```

The backend will run on `http://localhost:5000`

### 5. Start the Frontend

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check and status
- `GET /api/predict` - Get 24H Bitcoin price prediction
- `GET /api/historical?days=30` - Get historical Bitcoin data

## Model Details

- **Architecture:** LSTM (Long Short-Term Memory)
- **Input Features:** BTC_Close, BTC_Volume
- **Sequence Length:** 60 days
- **Training Data:** 10+ years of Bitcoin history (2014-2025)
- **Accuracy:** ~92.5%

## Screenshots

The application features:
- Top navigation with symbol selector and tools (like TradingView)
- Full-screen Bitcoin candlestick chart with volume
- AI prediction panel showing forecasted price with confidence
- Trading panel with buy/sell functionality

## Development

### Update Bitcoin Data

```bash
python data_engine.py
```

### Retrain Model

Open `train_model.ipynb` and run all cells.

## License

MIT

---

**⚠️ DISCLAIMER:** This application is for educational purposes only. Do not use for real trading without proper risk management.
