import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_WPYs4n8AebOF@ep-raspy-mode-a16c5db8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()