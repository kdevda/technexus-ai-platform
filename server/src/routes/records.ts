import express, { Request, Response } from 'express';
import { query as dbQuery } from '../db/utils';
import { QueryResult } from 'pg';

interface TableResult {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  fields: FieldResult[];
}

interface FieldResult {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  description?: string;
  defaultValue?: string;
  validation?: string;
}

const router = express.Router();

// Update your routes to use the pg query instead of prisma
router.get('/:tableId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableId } = req.params;
    
    const tableResult: QueryResult<TableResult> = await dbQuery<TableResult>(
      'SELECT * FROM table_definitions WHERE id = $1',
      [tableId]
    );
    
    if (tableResult.rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const table = tableResult.rows[0];
    
    // Get records
    const recordsResult = await dbQuery(
      `SELECT * FROM "${table.name}"`,
      []
    );

    res.json(recordsResult.rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Create a new record
router.post('/tables/:tableId/records', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableId } = req.params;
    const recordData = req.body;

    const tableResult: QueryResult<TableResult> = await dbQuery<TableResult>(
      'SELECT * FROM table_definitions WHERE id = $1',
      [tableId]
    );
    
    if (tableResult.rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const table = tableResult.rows[0];

    // Validate required fields
    const missingFields = table.fields
      .filter((field: FieldResult) => field.required && !recordData[field.name])
      .map((field: FieldResult) => field.name);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        details: `Fields ${missingFields.join(', ')} are required`
      });
      return;
    }

    // Format the data according to field types
    const formattedData: Record<string, any> = {};
    for (const field of table.fields) {
      if (recordData[field.name] !== undefined) {
        switch (field.type) {
          case 'number':
          case 'currency':
            formattedData[field.name] = parseFloat(recordData[field.name]);
            break;
          case 'boolean':
            formattedData[field.name] = Boolean(recordData[field.name]);
            break;
          default:
            formattedData[field.name] = recordData[field.name];
        }
      }
    }

    // Prepare field names and values for the query
    const fieldNames = Object.keys(formattedData);
    const fieldValues = Object.values(formattedData);
    const placeholders = fieldValues.map((_, i) => `$${i + 1}`);

    // Create the record using $executeRawUnsafe
    const query = `
      INSERT INTO "${table.name}" (${fieldNames.map(name => `"${name}"`).join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *;
    `;

    console.log('Executing query:', query, fieldValues);

    const result = await dbQuery(query, fieldValues);
    const newRecord = result.rows[0];

    if (!newRecord) {
      throw new Error('Failed to create record - no data returned');
    }

    res.status(201).json({ 
      message: 'Record created successfully',
      record: newRecord
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ 
      error: 'Failed to create record',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get a single record by ID
router.get('/:tableId/:recordId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableId, recordId } = req.params;
    const tableResult = await dbQuery(
      'SELECT * FROM table_definitions WHERE id = $1',
      [tableId]
    );
    
    if (tableResult.rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const table = tableResult.rows[0];

    const recordResult = await dbQuery(
      `SELECT * FROM "${table.name}" WHERE id = $1::uuid`,
      [recordId]
    );

    if (recordResult.rows.length === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    res.json(recordResult.rows[0]);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ 
      error: 'Failed to fetch record',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 