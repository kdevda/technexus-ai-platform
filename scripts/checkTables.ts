import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTables() {
  try {
    console.log('Checking TableDefinition records...');
    const tables = await prisma.tableDefinition.findMany({
      include: {
        fields: true
      }
    });

    console.log('\nFound tables:');
    tables.forEach(table => {
      console.log(`\nTable: ${table.name}`);
      console.log('Fields:');
      table.fields.forEach(field => {
        console.log(`- ${field.name} (${field.type})`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables(); 