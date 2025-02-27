import { Pool, QueryResult, QueryResultRow } from 'pg';
import { pool } from './index';

export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function getClient(): Promise<Pool> {
  return pool;
} 