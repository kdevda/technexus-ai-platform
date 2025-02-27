import { exec, execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Field {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string | null;
}

export async function generateAndRunMigration(tableName: string, fields: Field[]) {
  const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
  const backupPath = `${schemaPath}.backup`;
  
  try {
    console.log('Generating migration for table:', tableName);

    // Generate Prisma schema addition
    const schemaAddition = generatePrismaSchema(tableName, fields);
    console.log('Generated schema:', schemaAddition);
    
    // Backup current schema
    await fs.copyFile(schemaPath, backupPath);
    
    // Read and update schema
    const currentSchema = await fs.readFile(schemaPath, 'utf-8');
    await fs.writeFile(schemaPath, `${currentSchema}\n${schemaAddition}`);
    
    try {
      // Run migrations synchronously to avoid race conditions
      console.log('Running Prisma migration...');
      const migrationName = `add_${tableName.toLowerCase()}_table`;
      
      execSync(`npx prisma migrate dev --name ${migrationName} --create-only`, { stdio: 'inherit' });
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      console.log('Migration completed successfully');
      
    } catch (error) {
      console.error('Migration command failed:', error);
      // Restore backup
      await fs.copyFile(backupPath, schemaPath);
      throw error;
    }
    
  } catch (error) {
    console.error('Error in migration generation:', error);
    throw new Error(`Failed to generate migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up backup
    try {
      await fs.unlink(backupPath);
    } catch (e) {
      console.error('Error cleaning up backup:', e);
    }
  }
}

function generatePrismaSchema(tableName: string, fields: Field[]): string {
  const modelName = capitalizeFirst(tableName);
  
  const fieldDefinitions = fields.map(field => {
    const type = mapToPrismaType(field.type);
    const modifiers = [];
    
    if (field.required) modifiers.push('');
    else modifiers.push('?');
    
    if (field.unique) modifiers.push('@unique');
    
    if (field.defaultValue) {
      const defaultValueStr = type === 'String' ? `"${field.defaultValue}"` : field.defaultValue;
      modifiers.push(`@default(${defaultValueStr})`);
    }
    
    return `  ${field.name} ${type}${modifiers.join(' ')}`;
  }).join('\n');

  return `
model ${modelName} {
${fieldDefinitions}
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("${tableName.toLowerCase()}")
}`;
}

function mapToPrismaType(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'String',
    'number': 'Int',
    'boolean': 'Boolean',
    'datetime': 'DateTime',
    'currency': 'Decimal',
    'json': 'Json',
    'binary': 'Bytes',
  };
  
  return typeMap[type] || 'String';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
} 