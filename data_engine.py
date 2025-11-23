import yfinance as yf
import pandas as pd
import os
from datetime import datetime, timedelta

# CONFIGURATION
# We will store data in a 'data' folder
DATA_DIR = 'TradingProject/data'
# Tickers to track (Yahoo Finance format)
SYMBOLS = ['BTC-USD']
START_DATE = "2012-01-01"

def ensure_data_dir():
    """Creates the data folder if it doesn't exist."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"📁 Created directory: {DATA_DIR}")

def get_last_date(file_path):
    """
    Reads the CSV and returns the last date found.
    """
    if not os.path.exists(file_path):
        return None
    
    try:
        df = pd.read_csv(file_path)
        # Assuming the first column is 'Date'
        last_date_str = df.iloc[-1]['Date']
        # Convert to datetime object
        return datetime.strptime(last_date_str, '%Y-%m-%d')
    except Exception as e:
        print(f"⚠️ Error reading {file_path}: {e}")
        return None

def update_dataset(symbol):
    ensure_data_dir()
    file_path = os.path.join(DATA_DIR, f"{symbol.replace('-', '_')}.csv")
    
    # 1. Determine Start Date
    last_date = get_last_date(file_path)
    
    if last_date is None:
        # Scenario A: No data exists. Download from 2012.
        print(f"🆕 {symbol}: No local data found. Downloading from {START_DATE}...")
        download_start = START_DATE
        mode = 'w' # Write mode
        header = True
    else:
        # Scenario B: Data exists. Check if we need to update.
        today = datetime.now()
        if last_date.date() >= (today - timedelta(days=1)).date():
            print(f"✅ {symbol}: Data is already up to date ({last_date.date()}).")
            return
        
        # Start downloading from the NEXT day
        next_day = last_date + timedelta(days=1)
        download_start = next_day.strftime('%Y-%m-%d')
        print(f"🔄 {symbol}: Updating continuous data from {download_start}...")
        mode = 'a' # Append mode
        header = False # Don't repeat headers in CSV

    # 2. Download Data
    try:
        # Yahoo Finance download
        df = yf.download(symbol, start=download_start, progress=False)
        
        if df.empty:
            print(f"⚠️ {symbol}: No new data found.")
            return

        # 3. Clean Data
        df.reset_index(inplace=True)
        # Keep only essential columns
        df = df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
        
        # Flatten multi-index columns if they exist (common yfinance issue)
        df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]
        
        # Rename columns with BTC prefix
        df.columns = ['Date', 'BTC_Open', 'BTC_High', 'BTC_Low', 'BTC_Close', 'BTC_Volume']
        
        # formatting date to standard string
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')

        # 4. Save to CSV
        df.to_csv(file_path, mode=mode, header=header, index=False)
        
        if mode == 'w':
            print(f"✅ {symbol}: Saved {len(df)} rows (Full History).")
        else:
            print(f"✅ {symbol}: Appended {len(df)} new rows.")
            
    except Exception as e:
        print(f"❌ Error updating {symbol}: {e}")

if __name__ == "__main__":
    print("--- 🚀 STARTING DATA ENGINE ---")
    for sym in SYMBOLS:
        update_dataset(sym)
    print("--- ✅ DATA COLLECTION COMPLETE ---")