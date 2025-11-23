import os

print("--- 🔍 DIAGNOSTIC TOOL ---")

# 1. Where are we?
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"📂 Current Folder: {current_dir}")

# 2. Check models folder
models_dir = os.path.join(current_dir, 'models')
if not os.path.exists(models_dir):
    print("❌ ERROR: 'models' folder does not exist!")
else:
    print(f"✅ 'models' folder found.")
    print("   Contents:")
    files = os.listdir(models_dir)
    for f in files:
        size = os.path.getsize(os.path.join(models_dir, f))
        print(f"   - {f} ({size} bytes)")

# 3. Check specific file
target_file = os.path.join(models_dir, 'market_model.keras')
print(f"\n🎯 Looking for: {target_file}")
if os.path.exists(target_file):
    print("   ✅ File EXISTS.")
else:
    print("   ❌ File NOT FOUND.")

input("\nPress Enter to exit...")
