import asyncio
from datetime import datetime, timezone
import logging
from app.core.supabase_client import supabase_backend_service
from app.adapters.upsc_adapter import UPSCAdapter

logger = logging.getLogger(__name__)

# Basic adapter mapping
ADAPTERS = {
    "UPSC Official Portal": UPSCAdapter,
}

async def fetch_sources_job():
    """Background job that runs periodically to fetch and update exam data."""
    logger.info("Running fetch_sources_job...")
    
    # 1. Fetch active sources from Supabase
    sources = supabase_backend_service.get_active_exam_sources()
    
    for source in sources:
        adapter_cls = ADAPTERS.get(source['name'])
        if not adapter_cls:
            continue
            
        adapter = adapter_cls(source_id=source['id'], base_url=source['base_url'])
        logger.info(f"Fetching data for {source['name']} via {source['exam_url']}")
        
        # 2. Fetch raw content
        raw_html = await adapter.fetch(source['exam_url'])
        if not raw_html:
            supabase_backend_service.update_source_status(source['id'], success=False, error="Failed to fetch URL")
            continue
            
        # 3. Parse and Validate
        parsed_data = await adapter.parse(raw_html)
        if not adapter.validate(parsed_data):
            supabase_backend_service.update_source_status(source['id'], success=False, error="Validation failed")
            continue
            
        supabase_backend_service.update_source_status(source['id'], success=True)
        
        # 4. Compare with existing dates & queue for verification if changed
        # We need to know which exam this source belongs to. 
        # For MVP, we pass the parsed data to a change detection service
        # supabase_backend_service.detect_and_queue_changes(source['id'], parsed_data)
        
    logger.info("fetch_sources_job completed.")


async def start_scheduler():
    """Starts the background scheduler."""
    while True:
        try:
            await fetch_sources_job()
        except Exception as e:
            logger.error(f"Error in scheduler loop: {e}")
            
        # Run every 6 hours (21600 seconds)
        # For testing purposes, you can lower this.
        await asyncio.sleep(21600)
