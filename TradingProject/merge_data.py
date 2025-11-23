import pandas as pd
import os

def merge_datasets():
    print("🔄 Merging BTC and ETH data (Preserving EVERYTHING)...")
    
    # 1. Load both files
    if not os.path.exists('data/BTC_USD.csv') or not os.path.exists('data/ETH_USD.csv'):
        print("❌ Error: Missing CSV files. Run data_engine.py first!")
        return

    btc = pd.read_csv('data/BTC_USD.csv')
    eth = pd.read_csv('data/ETH_USD.csv')
    
    # 2. Rename columns explicitly so we know which is which
    # We prefix every column with the coin name
    btc.columns = ['Date', 'BTC_Open', 'BTC_High', 'BTC_Low', 'BTC_Close', 'BTC_Vol']
    eth.columns = ['Date', 'ETH_Open', 'ETH_High', 'ETH_Low', 'ETH_Close', 'ETH_Vol']
    
    # 3. Merge on Date
    # 'inner' join means we only keep history where BOTH coins existed
    merged = pd.merge(btc, eth, on='Date', how='inner')
    
    # 4. Save
    merged.to_csv('data/MARKET_MASTER.csv', index=False)
    
    print(f"✅ Success! Created 'data/MARKET_MASTER.csv'.")
    print(f"   Rows: {len(merged)}")
    print(f"   Columns: {list(merged.columns)}")
    print("-" * 30)
    print(merged.head())

if __name__ == "__main__":
    merge_datasets()