#!/bin/bash
# Force fresh Prisma generation
rm -rf node_modules/.prisma
npx prisma generate
npm run build
