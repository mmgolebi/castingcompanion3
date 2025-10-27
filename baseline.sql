-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ACTOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ACTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStatus" TEXT DEFAULT 'inactive',
    "stripeCustomerId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileSlug" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "age" INTEGER,
    "playableAgeMin" INTEGER,
    "playableAgeMax" INTEGER,
    "gender" TEXT,
    "ethnicity" TEXT,
    "unionStatus" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "visibleTattoos" BOOLEAN NOT NULL DEFAULT false,
    "headshot" TEXT,
    "fullBodyPhoto" TEXT,
    "resume" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "availability" TEXT,
    "reliableTransportation" BOOLEAN NOT NULL DEFAULT false,
    "travelWilling" BOOLEAN NOT NULL DEFAULT false,
    "compensationPreference" TEXT,
    "compensationMin" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "roleTypesInterested" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastingCall" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "production" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "compensation" TEXT NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "shootingDates" TEXT,
    "ageRangeMin" INTEGER,
    "ageRangeMax" INTEGER,
    "gender" TEXT,
    "ethnicity" TEXT,
    "unionStatus" TEXT NOT NULL,
    "castingEmail" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CastingCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "castingCallId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "submissionMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeadshotAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "lightingScore" INTEGER NOT NULL,
    "compositionScore" INTEGER NOT NULL,
    "expressionScore" INTEGER NOT NULL,
    "professionalScore" INTEGER NOT NULL,
    "backgroundScore" INTEGER NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "detailedFeedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeadshotAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_profileSlug_key" ON "Profile"("profileSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_profileId_castingCallId_key" ON "Submission"("profileId", "castingCallId");

-- CreateIndex
CREATE INDEX "HeadshotAnalysis_userId_idx" ON "HeadshotAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_castingCallId_fkey" FOREIGN KEY ("castingCallId") REFERENCES "CastingCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadshotAnalysis" ADD CONSTRAINT "HeadshotAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

