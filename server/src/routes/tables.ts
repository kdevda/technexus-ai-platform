import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateAndRunMigration } from '../utils/migrationGenerator';

// Define interfaces for table and field types
interface TableDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  fields: FieldDefinition[];
}

interface FieldDefinition {
  id: string;
  name: string;
  displayName: string;
  type: string;
  required: boolean;
  unique: boolean;
  description: string | null;
  defaultValue: string | null;
  validation: string | null;
  tableId: string;
  createdAt: Date;
  updatedAt: Date;
}

const router = express.Router();

// Get all tables
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('GET /api/tables: Fetching all tables...');
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const tables = await prisma.tableDefinition.findMany({
      include: {
        fields: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!tables) {
      console.log('No tables found');
      return res.status(200).json([]);
    }
    
    const formattedTables = tables.map(table => ({
      id: table.id,
      name: table.name,
      label: table.displayName,
      description: table.description || '',
      fields: table.fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.displayName,
        type: field.type,
        required: field.required,
        unique: field.unique,
        description: field.description || '',
        defaultValue: field.defaultValue,
        validation: field.validation
      })),
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString()
    }));

    console.log('GET /api/tables: Returning', tables.length, 'tables');
    console.log('Tables:', JSON.stringify(formattedTables, null, 2));
    
    return res.status(200).json(formattedTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single table
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const table = await prisma.tableDefinition.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        error: 'Table not found',
        details: `No table found with id: ${id}`
      });
    }

    const formattedTable = {
      id: table.id,
      name: table.name,
      label: table.displayName,
      description: table.description || '',
      fields: table.fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.displayName,
        type: field.type,
        required: field.required,
        unique: field.unique,
        description: field.description || '',
        defaultValue: field.defaultValue,
        validation: field.validation
      })),
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString()
    };

    return res.json(formattedTable);
  } catch (error) {
    console.error('Error fetching table:', error);
    return res.status(500).json({
      error: 'Failed to fetch table',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new table
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, fields } = req.body;

    console.log('Received create table request:', {
      name,
      displayName,
      description,
      fieldCount: fields?.length
    });

    // Validate input
    if (!name || !displayName || !fields || !Array.isArray(fields)) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Name, displayName, and fields array are required',
        received: { name, displayName, fieldCount: fields?.length }
      });
    }

    // Format the table name
    const formattedName = name.toLowerCase().replace(/\s+/g, '_');

    // Check if table already exists
    const existingTable = await prisma.tableDefinition.findFirst({
      where: { name: formattedName }
    });

    if (existingTable) {
      return res.status(409).json({
        error: 'Table already exists',
        details: `A table with name "${formattedName}" already exists`
      });
    }

    // Format fields
    const formattedFields = fields.map(field => ({
      ...field,
      name: field.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: field.displayName || field.name,
      description: field.description || `${field.name} field`,
      required: field.required ?? false,
      unique: field.unique ?? false
    }));

    // Add id field if not present
    if (!formattedFields.some(f => f.name === 'id')) {
      formattedFields.unshift({
        name: 'id',
        displayName: 'ID',
        type: 'string',
        required: true,
        unique: true,
        description: 'Primary key',
        defaultValue: null,
        validation: null
      });
    }

    console.log('Creating table with formatted fields:', {
      name: formattedName,
      displayName,
      fieldCount: formattedFields.length
    });

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create table definition
      const tableDefinition = await tx.tableDefinition.create({
        data: {
          name: formattedName,
          displayName,
          description,
          fields: {
            create: formattedFields
          }
        },
        include: {
          fields: true
        }
      });

      // 2. Generate and execute migration
      try {
        await generateAndRunMigration(formattedName, formattedFields);
      } catch (error) {
        console.error('Migration failed:', error);
        throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return tableDefinition;
    });

    // Format response
    const response = {
      id: result.id,
      name: result.name,
      label: result.displayName,
      description: result.description || '',
      fields: result.fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.displayName,
        type: field.type,
        required: field.required,
        unique: field.unique,
        description: field.description || '',
        defaultValue: field.defaultValue,
        validation: field.validation
      })),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    };

    return res.status(201).json({
      success: true,
      data: response,
      message: 'Table created successfully'
    });

  } catch (error) {
    console.error('Error creating table:', error);
    return res.status(500).json({
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    });
  }
});

// Add field to table
router.post('/:tableId/fields', async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params;
    const fieldData = req.body;

    const field = await prisma.fieldDefinition.create({
      data: {
        ...fieldData,
        tableId,
      },
    });

    return res.json(field);
  } catch (error) {
    console.error('Error adding field:', error);
    return res.status(500).json({ error: 'Failed to add field' });
  }
});

// Add this debug endpoint temporarily
router.get('/debug', async (_req, res) => {
  try {
    const tables = await prisma.tableDefinition.findMany();
    const count = await prisma.tableDefinition.count();
    
    res.json({
      count,
      tables: tables.map(t => ({
        id: t.id,
        name: t.name,
        displayName: t.displayName
      }))
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router; 