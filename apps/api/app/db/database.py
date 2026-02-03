import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager
from ..config import DATABASE_PATH, DATA_DIR

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)


async def init_db():
    """Initialize the database with schema."""
    schema_path = Path(__file__).parent / "schema.sql"

    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Enable WAL mode for better concurrency
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")

        # Read and execute schema
        with open(schema_path, "r") as f:
            schema = f.read()

        await db.executescript(schema)
        await db.commit()


@asynccontextmanager
async def get_db():
    """Get a database connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row

    try:
        await db.execute("PRAGMA foreign_keys=ON")
        yield db
    finally:
        await db.close()


async def execute_query(query: str, params: tuple = ()):
    """Execute a query and return results."""
    async with get_db() as db:
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def execute_insert(query: str, params: tuple = ()):
    """Execute an insert and return the last row id."""
    async with get_db() as db:
        cursor = await db.execute(query, params)
        await db.commit()
        return cursor.lastrowid


async def execute_update(query: str, params: tuple = ()):
    """Execute an update and return rows affected."""
    async with get_db() as db:
        cursor = await db.execute(query, params)
        await db.commit()
        return cursor.rowcount
