-- Create the n8n database if it does not exist
SELECT 'CREATE DATABASE n8n_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n_dev')\gexec
