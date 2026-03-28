#!/bin/bash
# ==========================================
# Waha Health Care - Automated Database Backup Script
# It takes a pg_dump, compresses it, and keeps last 7 days of backups
# ==========================================

# Use environment variables or pass as arguments
DB_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/wahda_db"}
BACKUP_DIR="/var/backups/wahda_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting database backup..."

# Dump database and compress
pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "[$(date)] Backup successful: $BACKUP_FILE"
else
  echo "[$(date)] Backup failed!"
  exit 1
fi

# Rotate backups: keep only last 7 days
echo "[$(date)] Cleaning up old backups (older than 7 days)..."
find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +7 -exec rm {} \;

echo "[$(date)] Cleanup finished."
