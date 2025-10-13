import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'CASTING_DIRECTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const castingCalls = [
      // Alabama
      {
        title: 'Supporting Role - Southern Drama Film',
        description: 'Seeking talented actor for supporting role in independent drama about a small-town Alabama family. Character is a local shop owner with Southern charm and complex backstory. Shooting in Birmingham area. 10-day shoot.',
        projectType: 'FEATURE_FILM',
        location: 'Birmingham, AL',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2025-11-25'),
        compensation: '$150-200/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 35,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Alaska
      {
        title: 'Lead Role - Wilderness Survival Series',
        description: 'Casting lead for new reality-drama hybrid series about survival in the Alaskan wilderness. Must be comfortable filming outdoors in cold weather conditions. Prior outdoor experience preferred. 6-week commitment.',
        projectType: 'TV_SERIES',
        location: 'Anchorage, AK',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-01-15'),
        compensation: '$3,500/week',
        unionStatus: 'EITHER',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-10-25'),
        userId: userId
      },
      
      // Arizona
      {
        title: 'Background Actors - Western Film',
        description: 'Seeking background actors for major studio Western film shooting in Arizona. Multiple roles available: saloon patrons, townspeople, ranch hands. Authentic period look required. Must be available for full shoot dates.',
        projectType: 'FEATURE_FILM',
        location: 'Phoenix, AZ',
        shootingStartDate: new Date('2025-11-20'),
        shootingEndDate: new Date('2025-12-15'),
        compensation: '$150/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'BACKGROUND',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Arkansas
      {
        title: 'Print Ad Campaign - Local Furniture Store',
        description: 'Seeking family for print advertising campaign for Arkansas furniture retailer. Looking for warm, authentic family dynamic. Photos will be used in catalogs and online. One-day shoot.',
        projectType: 'COMMERCIAL',
        location: 'Little Rock, AR',
        shootingStartDate: new Date('2025-10-28'),
        shootingEndDate: new Date('2025-10-28'),
        compensation: '$500/person',
        unionStatus: 'NON_UNION',
        ageRangeMin: 25,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-22'),
        userId: userId
      },
      
      // California
      {
        title: 'Co-Star - Network Medical Drama',
        description: 'Casting co-star role for established network medical drama. Character is a patient with compelling backstory. Strong emotional range required. Shoots in Los Angeles. SAG rates apply.',
        projectType: 'TV_SERIES',
        location: 'Los Angeles, CA',
        shootingStartDate: new Date('2025-11-12'),
        shootingEndDate: new Date('2025-11-14'),
        compensation: 'SAG Scale',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 30,
        ageRangeMax: 50,
        gender: 'FEMALE',
        ethnicity: 'ANY',
        roleType: 'CO_STAR',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-10-30'),
        userId: userId
      },
      
      // Colorado
      {
        title: 'Outdoor Recreation Commercial - REI',
        description: 'National commercial for outdoor retailer. Seeking adventurous types comfortable with hiking, camping, outdoor activities. Must be genuinely active outdoors. Multiple roles available. Shooting in Colorado mountains.',
        projectType: 'COMMERCIAL',
        location: 'Denver, CO',
        shootingStartDate: new Date('2025-11-08'),
        shootingEndDate: new Date('2025-11-10'),
        compensation: '$2,000/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-28'),
        userId: userId
      },
      
      // Connecticut
      {
        title: 'Regional Theater Production - A Christmas Carol',
        description: 'Casting multiple roles for holiday production of A Christmas Carol at regional theater. Seeking actors for ensemble and featured roles. Strong singing voice preferred. Runs November-December.',
        projectType: 'THEATER',
        location: 'Hartford, CT',
        shootingStartDate: new Date('2025-11-22'),
        shootingEndDate: new Date('2025-12-28'),
        compensation: '$600-800/week',
        unionStatus: 'EQUITY',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-10-25'),
        userId: userId
      },
      
      // Delaware
      {
        title: 'Student Film - Coming of Age Drama',
        description: 'University of Delaware thesis film seeking lead actors for coming-of-age story. Non-paid but meals provided, copy for reel, and IMDb credit. Great opportunity for emerging actors.',
        projectType: 'SHORT_FILM',
        location: 'Wilmington, DE',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2025-11-17'),
        compensation: 'Copy/Credit/Meals',
        unionStatus: 'NON_UNION',
        ageRangeMin: 16,
        ageRangeMax: 22,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Florida
      {
        title: 'Theme Park Live Show Performers',
        description: 'Orlando theme park seeking performers for new live show. Must have strong singing/dancing background. Character acting skills a plus. Six-month contract with possibility of extension.',
        projectType: 'OTHER',
        location: 'Orlando, FL',
        shootingStartDate: new Date('2026-01-15'),
        shootingEndDate: new Date('2026-07-15'),
        compensation: '$750/week',
        unionStatus: 'EITHER',
        ageRangeMin: 18,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Georgia
      {
        title: 'Recurring Role - Cable TV Series',
        description: 'Casting recurring character for second season of cable drama series. Character appears in 6 episodes. Strong dramatic chops required. Atlanta-based production.',
        projectType: 'TV_SERIES',
        location: 'Atlanta, GA',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-02-15'),
        compensation: '$3,000/episode',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 28,
        ageRangeMax: 42,
        gender: 'MALE',
        ethnicity: 'BLACK',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-08'),
        userId: userId
      },
      
      // Hawaii
      {
        title: 'Travel Commercial - Hawaiian Airlines',
        description: 'Seeking locals and visitors for Hawaiian Airlines commercial. Looking for diverse, authentic people enjoying Hawaii. Beach scenes, family moments. Shoots on Oahu.',
        projectType: 'COMMERCIAL',
        location: 'Honolulu, HI',
        shootingStartDate: new Date('2025-11-18'),
        shootingEndDate: new Date('2025-11-20'),
        compensation: '$1,500/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 8,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'BACKGROUND',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Idaho
      {
        title: 'Independent Feature - Rural Drama',
        description: 'Low-budget independent feature about potato farming family in Idaho. Seeking authentic actors who understand rural life. Multiple supporting roles available.',
        projectType: 'FEATURE_FILM',
        location: 'Boise, ID',
        shootingStartDate: new Date('2025-12-05'),
        shootingEndDate: new Date('2025-12-20'),
        compensation: '$125/day + meals',
        unionStatus: 'NON_UNION',
        ageRangeMin: 30,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'WHITE',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Illinois
      {
        title: 'Guest Star - Chicago Fire',
        description: 'Dick Wolf production seeking guest star for Chicago Fire episode. Character is fire victim with powerful arc. Must be available for table read and 5 shoot days.',
        projectType: 'TV_SERIES',
        location: 'Chicago, IL',
        shootingStartDate: new Date('2025-11-10'),
        shootingEndDate: new Date('2025-11-17'),
        compensation: 'SAG Scale + 10%',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 40,
        gender: 'FEMALE',
        ethnicity: 'LATIN',
        roleType: 'GUEST_STAR',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-10-28'),
        userId: userId
      },
      
      // Indiana
      {
        title: 'Local Car Dealership Commercial',
        description: 'Indianapolis car dealership seeking spokesperson for local TV spots. Must be energetic, trustworthy. Will appear in multiple commercials over 6 months.',
        projectType: 'COMMERCIAL',
        location: 'Indianapolis, IN',
        shootingStartDate: new Date('2025-11-01'),
        shootingEndDate: new Date('2025-11-02'),
        compensation: '$1,000 + usage fees',
        unionStatus: 'NON_UNION',
        ageRangeMin: 30,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-10-25'),
        userId: userId
      },
      
      // Iowa
      {
        title: 'Documentary Re-enactments',
        description: 'Historical documentary about Iowa farming needs actors for re-enactment scenes. Period: 1950s-1970s. Must be comfortable with farm animals and outdoor shooting.',
        projectType: 'OTHER',
        location: 'Des Moines, IA',
        shootingStartDate: new Date('2025-11-22'),
        shootingEndDate: new Date('2025-11-24'),
        compensation: '$200/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-10'),
        userId: userId
      },
      
      // Kansas
      {
        title: 'Tornado Documentary - Weather Channel',
        description: 'Weather Channel documentary needs Kansas residents with storm-chasing experience. Looking for authentic personalities. Interviews and some re-creations.',
        projectType: 'OTHER',
        location: 'Wichita, KS',
        shootingStartDate: new Date('2025-11-05'),
        shootingEndDate: new Date('2025-11-12'),
        compensation: '$300/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 25,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-28'),
        userId: userId
      },
      
      // Kentucky
      {
        title: 'Bourbon Distillery Brand Video',
        description: 'Premium bourbon brand seeking actors for brand storytelling video. Looking for authentic Kentucky personalities. Will feature distillery process and heritage.',
        projectType: 'COMMERCIAL',
        location: 'Louisville, KY',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2025-12-03'),
        compensation: '$800/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 35,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Louisiana
      {
        title: 'Supporting Role - Southern Gothic Thriller',
        description: 'Major studio thriller filming in New Orleans. Seeking character actor for key supporting role. Dark, atmospheric film. 3-week shoot commitment.',
        projectType: 'FEATURE_FILM',
        location: 'New Orleans, LA',
        shootingStartDate: new Date('2025-11-25'),
        shootingEndDate: new Date('2025-12-15'),
        compensation: '$400/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 40,
        ageRangeMax: 60,
        gender: 'MALE',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-10'),
        userId: userId
      },
      
      // Maine
      {
        title: 'L.L.Bean Lifestyle Commercial',
        description: 'Iconic Maine retailer seeking New England families for lifestyle commercial. Outdoor activities, cozy home scenes. Authentic Maine aesthetic required.',
        projectType: 'COMMERCIAL',
        location: 'Portland, ME',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2025-11-17'),
        compensation: '$1,200/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 5,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Maryland
      {
        title: 'Political Thriller - HBO Series',
        description: 'HBO limited series about DC politics needs Baltimore-based actors for recurring roles. Multiple episodes. Must be available for extended shoot.',
        projectType: 'TV_SERIES',
        location: 'Baltimore, MD',
        shootingStartDate: new Date('2025-12-10'),
        shootingEndDate: new Date('2026-03-15'),
        compensation: '$2,500/episode',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 30,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-20'),
        userId: userId
      },
      
      // Massachusetts
      {
        title: 'Period Drama - Boston Setting',
        description: 'Independent feature set in 1970s Boston. Seeking actors with authentic Boston accent. Story about working-class Irish family. Multiple supporting roles.',
        projectType: 'FEATURE_FILM',
        location: 'Boston, MA',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-01-10'),
        compensation: '$200/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'WHITE',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Michigan
      {
        title: 'Automotive Industry Documentary',
        description: 'Major streaming platform documentary about Detroit auto industry. Seeking current/former auto workers for interviews and reenactments.',
        projectType: 'OTHER',
        location: 'Detroit, MI',
        shootingStartDate: new Date('2025-11-08'),
        shootingEndDate: new Date('2025-11-15'),
        compensation: '$350/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 30,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-30'),
        userId: userId
      },
      
      // Minnesota
      {
        title: 'Regional Bank Commercial Campaign',
        description: 'Twin Cities bank seeking diverse families and individuals for year-long commercial campaign. Multiple shoots. Looking for warm, trustworthy personalities.',
        projectType: 'COMMERCIAL',
        location: 'Minneapolis, MN',
        shootingStartDate: new Date('2025-11-01'),
        shootingEndDate: new Date('2026-01-31'),
        compensation: '$1,000/day + residuals',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-10-25'),
        userId: userId
      },
      
      // Mississippi
      {
        title: 'Civil Rights Era Drama',
        description: 'Historical drama about 1960s Mississippi. Seeking actors for multiple roles. Powerful, important story. Some roles require Southern accent.',
        projectType: 'FEATURE_FILM',
        location: 'Jackson, MS',
        shootingStartDate: new Date('2025-12-15'),
        shootingEndDate: new Date('2026-01-30'),
        compensation: '$175/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-30'),
        userId: userId
      },
      
      // Missouri
      {
        title: 'Hallmark Christmas Movie',
        description: 'Hallmark Channel holiday movie filming in Kansas City. Seeking supporting actors and background for small-town Christmas story. Family-friendly production.',
        projectType: 'TV_MOVIE',
        location: 'Kansas City, MO',
        shootingStartDate: new Date('2025-11-18'),
        shootingEndDate: new Date('2025-12-05'),
        compensation: '$150/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 18,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Montana
      {
        title: 'Yellowstone Prequel Series',
        description: 'Taylor Sheridan production seeking Montana locals for new series. Looking for authentic ranchers, cowboys. Must be comfortable with horses and livestock.',
        projectType: 'TV_SERIES',
        location: 'Billings, MT',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-04-30'),
        compensation: '$500-800/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Nebraska
      {
        title: 'College Football Documentary',
        description: 'ESPN documentary about Nebraska college football culture. Seeking fans, former players, community members for interviews.',
        projectType: 'OTHER',
        location: 'Omaha, NE',
        shootingStartDate: new Date('2025-11-10'),
        shootingEndDate: new Date('2025-11-15'),
        compensation: '$250/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 18,
        ageRangeMax: 75,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-30'),
        userId: userId
      },
      
      // Nevada
      {
        title: 'Casino Heist Film - Supporting Roles',
        description: 'Major studio heist film set in Las Vegas. Seeking character actors for casino employees, security, patrons. Multiple day players needed.',
        projectType: 'FEATURE_FILM',
        location: 'Las Vegas, NV',
        shootingStartDate: new Date('2025-11-20'),
        shootingEndDate: new Date('2025-12-20'),
        compensation: 'SAG Scale',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // New Hampshire
      {
        title: 'Horror Short Film',
        description: 'Low-budget horror short filming in New Hampshire woods. Seeking actors comfortable with horror genre. Great for reel building. Copy/credit/meals provided.',
        projectType: 'SHORT_FILM',
        location: 'Manchester, NH',
        shootingStartDate: new Date('2025-11-08'),
        shootingEndDate: new Date('2025-11-10'),
        compensation: 'Copy/Credit/Meals',
        unionStatus: 'NON_UNION',
        ageRangeMin: 18,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-28'),
        userId: userId
      },
      
      // New Jersey
      {
        title: 'Pharmaceutical Commercial',
        description: 'National pharmaceutical commercial shooting in NJ. Seeking diverse actors for lifestyle scenes. Must convey warmth and authenticity.',
        projectType: 'COMMERCIAL',
        location: 'Newark, NJ',
        shootingStartDate: new Date('2025-11-12'),
        shootingEndDate: new Date('2025-11-13'),
        compensation: '$2,500/day + residuals',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 40,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-10-30'),
        userId: userId
      },
      
      // New Mexico
      {
        title: 'Netflix Series - Breaking Bad Universe',
        description: 'New series in Breaking Bad universe. Seeking New Mexico locals for recurring and day player roles. Multiple opportunities throughout season.',
        projectType: 'TV_SERIES',
        location: 'Albuquerque, NM',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-03-31'),
        compensation: 'SAG Scale',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // New York
      {
        title: 'Law & Order: SVU - Guest Star',
        description: 'Dick Wolf production casting guest star role for SVU episode. Strong dramatic range required. 5-day shoot commitment.',
        projectType: 'TV_SERIES',
        location: 'New York City, NY',
        shootingStartDate: new Date('2025-11-05'),
        shootingEndDate: new Date('2025-11-12'),
        compensation: 'SAG Scale + 10%',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 30,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'GUEST_STAR',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-10-25'),
        userId: userId
      },
      
      // North Carolina
      {
        title: 'Netflix Feature - Teen Drama',
        description: 'Netflix coming-of-age drama filming in Charlotte. Seeking teen actors for supporting roles. Story about high school basketball team.',
        projectType: 'FEATURE_FILM',
        location: 'Charlotte, NC',
        shootingStartDate: new Date('2025-11-25'),
        shootingEndDate: new Date('2026-01-15'),
        compensation: '$250/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 14,
        ageRangeMax: 18,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-08'),
        userId: userId
      },
      
      // North Dakota
      {
        title: 'Oil Industry Documentary',
        description: 'Documentary about North Dakota oil boom. Seeking oil workers, local residents for interviews and reenactments. Authentic stories needed.',
        projectType: 'OTHER',
        location: 'Fargo, ND',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2025-11-20'),
        compensation: '$300/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 25,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Ohio
      {
        title: 'Marvel Studios Production',
        description: 'Major Marvel Studios project filming in Cleveland. Seeking background actors and featured extras. Sci-fi/action film. Multiple shoot days available.',
        projectType: 'FEATURE_FILM',
        location: 'Cleveland, OH',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-02-28'),
        compensation: '$150-300/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 18,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'BACKGROUND',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Oklahoma
      {
        title: 'Killers of the Flower Moon Follow-up',
        description: 'Apple TV+ limited series about Oklahoma history. Seeking Native American actors for authentic representation. Multiple roles available.',
        projectType: 'TV_SERIES',
        location: 'Oklahoma City, OK',
        shootingStartDate: new Date('2025-12-10'),
        shootingEndDate: new Date('2026-03-30'),
        compensation: '$400/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 20,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'NATIVE_AMERICAN',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-20'),
        userId: userId
      },
      
      // Oregon
      {
        title: 'Nike Commercial - Athletes',
        description: 'Nike seeking athletes for inspirational commercial campaign. Must be actively involved in sports. Shooting in Portland area.',
        projectType: 'COMMERCIAL',
        location: 'Portland, OR',
        shootingStartDate: new Date('2025-11-22'),
        shootingEndDate: new Date('2025-11-24'),
        compensation: '$2,000/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 16,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-08'),
        userId: userId
      },
      
      // Pennsylvania
      {
        title: 'M. Night Shyamalan Film',
        description: 'New thriller from M. Night Shyamalan filming in Philadelphia. Seeking actors for supporting roles. Must be available for multiple weeks.',
        projectType: 'FEATURE_FILM',
        location: 'Philadelphia, PA',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2026-01-31'),
        compensation: 'SAG Scale',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Rhode Island
      {
        title: 'Coastal Drama - Independent Film',
        description: 'Independent feature about Rhode Island fishing community. Seeking local actors with New England authenticity. Character-driven drama.',
        projectType: 'FEATURE_FILM',
        location: 'Providence, RI',
        shootingStartDate: new Date('2025-12-05'),
        shootingEndDate: new Date('2025-12-20'),
        compensation: '$150/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 30,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-20'),
        userId: userId
      },
      
      // South Carolina
      {
        title: 'Outer Banks Season 5',
        description: 'Netflix hit series casting Charleston locals for Season 5. Multiple roles available throughout season. Teens and young adults.',
        projectType: 'TV_SERIES',
        location: 'Charleston, SC',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-04-30'),
        compensation: '$200-400/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 16,
        ageRangeMax: 30,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'SOME_EXPERIENCE',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // South Dakota
      {
        title: 'Mount Rushmore Tourism Commercial',
        description: 'South Dakota tourism board commercial. Seeking families and individuals enjoying SD attractions. Wholesome, adventurous vibe.',
        projectType: 'COMMERCIAL',
        location: 'Sioux Falls, SD',
        shootingStartDate: new Date('2025-11-18'),
        shootingEndDate: new Date('2025-11-21'),
        compensation: '$800/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 5,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Tennessee
      {
        title: 'Country Music Drama Series',
        description: 'CMT original series about Nashville music scene. Seeking actors who can sing. Multiple recurring roles throughout Season 1.',
        projectType: 'TV_SERIES',
        location: 'Nashville, TN',
        shootingStartDate: new Date('2025-12-10'),
        shootingEndDate: new Date('2026-03-15'),
        compensation: '$1,000-2,000/episode',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 22,
        ageRangeMax: 40,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-25'),
        userId: userId
      },
      
      // Texas
      {
        title: 'Friday Night Lights Reboot',
        description: 'New series inspired by FNL universe. Seeking Texas actors for high school football drama. Multiple leads and supporting roles.',
        projectType: 'TV_SERIES',
        location: 'Austin, TX',
        shootingStartDate: new Date('2025-12-01'),
        shootingEndDate: new Date('2026-04-30'),
        compensation: 'SAG Scale',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 14,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-15'),
        userId: userId
      },
      
      // Utah
      {
        title: 'Sundance Film Festival Short',
        description: 'Award-winning director\'s new short film. Seeking actors for character-driven drama. Will premiere at Sundance. Great for reel.',
        projectType: 'SHORT_FILM',
        location: 'Salt Lake City, UT',
        shootingStartDate: new Date('2025-11-20'),
        shootingEndDate: new Date('2025-11-25'),
        compensation: '$200/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 25,
        ageRangeMax: 40,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Vermont
      {
        title: 'Ben & Jerry\'s Brand Campaign',
        description: 'Ben & Jerry\'s seeking Vermont locals for brand storytelling campaign. Authentic Vermont personalities. Multiple commercials and online content.',
        projectType: 'COMMERCIAL',
        location: 'Burlington, VT',
        shootingStartDate: new Date('2025-11-15'),
        shootingEndDate: new Date('2025-11-20'),
        compensation: '$1,000/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 18,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'LEAD',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-01'),
        userId: userId
      },
      
      // Virginia
      {
        title: 'Military Drama - Pentagon Story',
        description: 'CBS drama about Pentagon staff. Seeking actors for recurring roles. Military experience or knowledge a plus. Virginia Beach area.',
        projectType: 'TV_SERIES',
        location: 'Virginia Beach, VA',
        shootingStartDate: new Date('2025-12-05'),
        shootingEndDate: new Date('2026-03-31'),
        compensation: '$800/day',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 28,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-20'),
        userId: userId
      },
      
      // Washington
      {
        title: 'Amazon Studios Series',
        description: 'New Amazon limited series filming in Seattle. Tech industry drama. Seeking actors for supporting roles. 8-episode commitment.',
        projectType: 'TV_SERIES',
        location: 'Seattle, WA',
        shootingStartDate: new Date('2025-12-15'),
        shootingEndDate: new Date('2026-04-30'),
        compensation: '$2,000/episode',
        unionStatus: 'SAG_AFTRA',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ASIAN',
        roleType: 'SUPPORTING',
        experienceRequired: 'PROFESSIONAL',
        expiresAt: new Date('2025-11-30'),
        userId: userId
      },
      
      // West Virginia
      {
        title: 'Appalachian Documentary',
        description: 'Documentary about modern Appalachian life. Seeking West Virginia residents to tell their stories. Authentic voices needed.',
        projectType: 'OTHER',
        location: 'Charleston, WV',
        shootingStartDate: new Date('2025-11-10'),
        shootingEndDate: new Date('2025-11-20'),
        compensation: '$250/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 18,
        ageRangeMax: 75,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-10-30'),
        userId: userId
      },
      
      // Wisconsin
      {
        title: 'Harley-Davidson Brand Documentary',
        description: 'Harley-Davidson documentary about motorcycle culture. Seeking riders and enthusiasts in Milwaukee area. Authentic personalities.',
        projectType: 'OTHER',
        location: 'Milwaukee, WI',
        shootingStartDate: new Date('2025-11-20'),
        shootingEndDate: new Date('2025-12-05'),
        compensation: '$300/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-05'),
        userId: userId
      },
      
      // Wyoming
      {
        title: 'National Parks Documentary Series',
        description: 'PBS documentary series about Yellowstone and Grand Teton. Seeking park rangers, locals, visitors for interviews and reenactments.',
        projectType: 'OTHER',
        location: 'Cheyenne, WY',
        shootingStartDate: new Date('2025-11-25'),
        shootingEndDate: new Date('2025-12-10'),
        compensation: '$300/day',
        unionStatus: 'NON_UNION',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        roleType: 'SUPPORTING',
        experienceRequired: 'NO_EXPERIENCE',
        expiresAt: new Date('2025-11-10'),
        userId: userId
      },
    ];

    const created = await prisma.castingCall.createMany({
      data: castingCalls,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully seeded ${created.count} casting calls`,
      count: created.count 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed casting calls',
      details: error.message 
    }, { status: 500 });
  }
}
