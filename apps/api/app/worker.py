"""
RQ Worker for background job processing.
"""
import os
from redis import Redis
from rq import Worker, Queue, Connection


def start_worker():
    """Start RQ worker to process background jobs."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

    # Connect to Redis (DB 2 is used for queue operations)
    redis_conn = Redis.from_url(f"{redis_url}/2")

    print(f"Starting RQ worker connected to {redis_url}/2")

    with Connection(redis_conn):
        queue = Queue("page_creation", connection=redis_conn)
        worker = Worker([queue], connection=redis_conn)
        print(f"Worker started, listening to queue: page_creation")
        worker.work(with_scheduler=True)


if __name__ == "__main__":
    start_worker()
