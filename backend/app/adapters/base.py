from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

class BaseAdapter(ABC):
    def __init__(self, source_id: str, base_url: str):
        self.source_id = source_id
        self.base_url = base_url

    async def fetch(self, url: str) -> Optional[str]:
        """Fetches raw HTML or JSON from the source."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.text
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            return None

    @abstractmethod
    async def parse(self, content: str) -> Dict[str, Any]:
        """Parses the raw content into a standard dictionary format."""
        pass

    def validate(self, parsed_data: Dict[str, Any]) -> bool:
        """Validates that extracted dates are logical."""
        # Simple validation: start_date <= end_date
        app_start = parsed_data.get("application_start_date")
        app_end = parsed_data.get("application_end_date")
        
        if app_start and app_end:
            try:
                start = datetime.strptime(app_start, "%Y-%m-%d")
                end = datetime.strptime(app_end, "%Y-%m-%d")
                if start > end:
                    return False
            except ValueError:
                return False
        return True

    def normalize_date(self, date_str: str) -> Optional[str]:
        """Convert various date strings into YYYY-MM-DD."""
        if not date_str:
            return None
        # Implement more sophisticated parsing here for MVP keep it simple
        try:
            # Assumes DD/MM/YYYY
            if "/" in date_str:
                parts = date_str.split("/")
                return f"{parts[2]}-{parts[1]}-{parts[0]}"
        except:
            return None
        return date_str
