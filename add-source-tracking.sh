#!/bin/bash

# Add source tracking to new landing pages
# Run from your castingcompanion3 root directory

echo "🎯 Adding source tracking to landing pages..."

# Chicago Fire
echo "Updating /apply-chicago-fire..."
sed -i '' "s/body: JSON.stringify({ email, password, name, role: 'ACTOR' })/body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'chicago-fire' })/" src/app/apply-chicago-fire/page.tsx

# The Bear
echo "Updating /apply-the-bear..."
sed -i '' "s/body: JSON.stringify({ email, password, name, role: 'ACTOR' })/body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'the-bear' })/" src/app/apply-the-bear/page.tsx

# Tulsa King
echo "Updating /apply-tulsa-king..."
sed -i '' "s/body: JSON.stringify({ email, password, name, role: 'ACTOR' })/body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'tulsa-king' })/" src/app/apply-tulsa-king/page.tsx

echo ""
echo "✅ Source tracking added!"
echo ""
echo "Committing and pushing..."

git add -A
git commit -m "Add source tracking to Chicago Fire, The Bear, and Tulsa King pages"
git push origin main

echo ""
echo "✅ Done! These sources will now appear in analytics:"
echo "   • chicago-fire"
echo "   • the-bear"
echo "   • tulsa-king"
