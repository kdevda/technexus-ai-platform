import { PrismaClient, Prisma } from '@prisma/client'
import path from 'path'
import fs from 'fs'

export class TableManager {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async syncTableDefinitions() {
    try {
      console.log('Reading Prisma schema...');
      const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');
      console.log('Schema path:', schemaPath);
      
      // Get Prisma DMMF
      const dmmf = Prisma.dmmf;
      const models = dmmf.datamodel.models;
      
      console.log('Found models:', models.map(m => m.name));

      for (const model of models) {
        console.log(`Processing model: ${model.name}`);
        
        // Skip certain system models if needed
        const skipModels = ['Migration', 'MigrationLock'];
        if (skipModels.includes(model.name)) {
          console.log(`Skipping system model: ${model.name}`);
          continue;
        }

        try {
          // Create or update table definition
          const tableDefinition = await this.prisma.tableDefinition.upsert({
            where: { name: model.name.toLowerCase() },
            update: {
              displayName: this.formatDisplayName(model.name),
              description: `${this.formatDisplayName(model.name)} table`,
            },
            create: {
              name: model.name.toLowerCase(),
              displayName: this.formatDisplayName(model.name),
              description: `${this.formatDisplayName(model.name)} table`,
            },
          });

          // Delete existing fields
          await this.prisma.fieldDefinition.deleteMany({
            where: { tableId: tableDefinition.id }
          });

          // Create fields
          const fields = model.fields.map(field => ({
            name: field.name,
            displayName: this.formatDisplayName(field.name),
            type: this.mapPrismaTypeToFieldType(field.type),
            required: field.isRequired,
            unique: field.isUnique,
            description: field.documentation || `${this.formatDisplayName(field.name)} field`,
            tableId: tableDefinition.id
          }));

          // Create fields in batches
          await this.prisma.fieldDefinition.createMany({
            data: fields
          });

          console.log(`Successfully processed model ${model.name} with ${fields.length} fields`);
        } catch (error) {
          console.error(`Error processing model ${model.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing table definitions:', error);
      throw error;
    }
  }

  private formatDisplayName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  private mapPrismaTypeToFieldType(prismaType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Int': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'DateTime': 'datetime',
      'Decimal': 'currency',
      'Json': 'json',
      'BigInt': 'number',
      'Bytes': 'binary',
      // Add more type mappings as needed
    }
    return typeMap[prismaType] || 'string'
  }
} 