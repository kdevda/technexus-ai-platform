import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { TableManager } from '../src/utils/tableManager'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting seed...');

    // Create admin user with hashed password
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      console.log('Creating admin user...');
      
      const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin'
        },
      })
      console.log('Admin user created:', admin.email);
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }

    // Sync table definitions from schema
    try {
      console.log('Syncing table definitions...');
      const tableManager = new TableManager(prisma)
      await tableManager.syncTableDefinitions()
      console.log('Table definitions synced');
    } catch (error) {
      console.error('Error syncing table definitions:', error);
      throw error;
    }

    // Seed integrations
    try {
      console.log('Creating integrations...');
      await prisma.integration.deleteMany()
      const integrations = [
        {
          name: 'Twilio',
          description: 'Voice and SMS communication platform',
          category: 'communication',
          icon: '/icons/twilio.svg',
          isEnabled: false,
        },
        {
          name: 'Resend',
          description: 'Email delivery service',
          category: 'communication',
          icon: '/icons/resend.svg',
          isEnabled: false,
        },
        {
          name: 'Stripe',
          description: 'Payment processing platform',
          category: 'payment',
          icon: '/icons/stripe.svg',
          isEnabled: false,
        }
      ]
      
      for (const integration of integrations) {
        await prisma.integration.create({ data: integration })
      }
      console.log('Integrations created:', integrations.length);
    } catch (error) {
      console.error('Error creating integrations:', error);
      throw error;
    }

    // Add this to your seed file if you want test data
    async function seedTestTable() {
      const testTable = await prisma.tableDefinition.create({
        data: {
          name: 'contacts',
          displayName: 'Contacts',
          description: 'Contact information for customers and leads',
          fields: {
            create: [
              {
                name: 'name',
                displayName: 'Name',
                type: 'string',
                required: true,
                description: 'Contact\'s full name'
              },
              {
                name: 'email',
                displayName: 'Email',
                type: 'string',
                required: true,
                unique: true,
                description: 'Contact\'s email address'
              },
              {
                name: 'phone',
                displayName: 'Phone',
                type: 'string',
                required: false,
                description: 'Contact\'s phone number'
              }
            ]
          }
        }
      });
      
      console.log('Created test table:', testTable);
    }

    // Add to your main function
    await seedTestTable();

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Unhandled error during seeding:', e);
  process.exit(1);
}); 