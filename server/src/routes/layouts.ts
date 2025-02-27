import express from 'express';
import { prisma } from '../db';

const router = express.Router();

// Create a new layout
router.post('/tables/:tableId/layouts', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { name, isDefault, sections } = req.body;

    // Check if table exists
    const table = await prisma.tableDefinition.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // If this layout is set as default, unset any existing default layout
    if (isDefault) {
      await prisma.tableLayout.updateMany({
        where: { 
          tableId,
          isDefault: true 
        },
        data: { 
          isDefault: false 
        }
      });
    }

    // Create the new layout
    const layout = await prisma.tableLayout.create({
      data: {
        name,
        displayName: name, // You can make this different if needed
        isDefault,
        tableId,
        sections: sections || []
      }
    });

    return res.json(layout);
  } catch (error) {
    console.error('Error creating layout:', error);
    return res.status(500).json({ 
      error: 'Failed to create layout',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get layouts for a table
router.get('/tables/:tableId/layouts', async (req, res) => {
  try {
    const { tableId } = req.params;

    const layouts = await prisma.tableLayout.findMany({
      where: { tableId }
    });

    return res.json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch layouts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all layouts for a table
router.get('/:tableId/layouts', async (req, res) => {
  try {
    const { tableId } = req.params;

    const layouts = await prisma.tableLayout.findMany({
      where: { tableId }
    });

    return res.json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch layouts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 