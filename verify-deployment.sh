#!/bin/bash

echo "🔍 Verifying all critical files were updated..."
echo ""

# Check if bio was added to profile
if grep -q "setup_future_usage" src/app/api/stripe/create-checkout-session/route.ts; then
  echo "✅ Payment method saving (setup_future_usage) - FIXED"
else
  echo "❌ Payment method saving - MISSING"
fi

# Check webhook fix
if grep -q "subscription.status," src/app/api/stripe/webhook/route.ts; then
  echo "✅ Webhook uses actual status - FIXED"
else
  echo "❌ Webhook status - MISSING"
fi

# Check setup-subscription fix
if grep -q "checkoutSessionId" src/app/api/stripe/setup-subscription/route.ts; then
  echo "✅ Setup-subscription attaches payment method - FIXED"
else
  echo "❌ Setup-subscription - MISSING"
fi

# Check bio in profile API
if grep -q "bio: user.profile?.bio" src/app/api/profile/route.ts; then
  echo "✅ Bio in profile API - FIXED"
else
  echo "❌ Bio in profile API - MISSING"
fi

# Check bio in public profile
if grep -q "profile.bio" "src/app/actor/[slug]/page.tsx"; then
  echo "✅ Bio on public profile page - FIXED"
else
  echo "❌ Bio on public profile - MISSING"
fi

# Check cover letter generation
if [ -f "src/app/api/generate-cover-letter/route.ts" ]; then
  echo "✅ Cover letter API endpoint - EXISTS"
else
  echo "❌ Cover letter API - MISSING"
fi

# Check cover letter in submissions page
if grep -q "coverLetter" src/app/dashboard/submissions/page.tsx; then
  echo "✅ Cover letter display in history - FIXED"
else
  echo "❌ Cover letter in history - MISSING"
fi

echo ""
echo "📊 Verification complete!"
