import sys
from pathlib import Path

# Ensure local imports resolve
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from database import engine, Base
from models import Builder, Project
from scraper import MahaRERAScraper

def main():
    print("Checking database tables...")
    Base.metadata.create_all(bind=engine)
    print("BuildIntel database connected and tables verified.")

    print("\nRunning MahaRERA listing scraper (Page 1)...")
    scraper = MahaRERAScraper(delay_seconds=1.5, timeout_seconds=25)
    scraper.run(start_page=1, end_page=1)

if __name__ == "__main__":
    main()