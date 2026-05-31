import path from 'path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { Pool } = await import('pg');
      const connectionString =
        process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? '';
      const pool = new Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
});
