import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const castingCalls = [
      // Alabama
      {
        title: 'Supporting Role - Southern Drama Film',
        production: 'Alabama Independent Films',
        description: 'Seeking talented actor for supporting role in independent drama about a small-town Alabama family. Character is a local shop owner with Southern charm and complex backstory. Shooting in Birmingham area. 10-day shoot.',
        roleType: 'SUPPORTING',
        location: 'Birmingham, AL',
        compensation: '$150-200/day',
        submissionDeadline: new Date('2025-10-31'),
        shootingDates: 'November 15-25, 2025',
        ageRangeMin: 35,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@alabamafilms.com',
        status: 'ACTIVE'
      },
      
      // Alaska
      {
        title: 'Lead Role - Wilderness Survival Series',
        production: 'Discovery Productions',
        description: 'Casting lead for new reality-drama hybrid series about survival in the Alaskan wilderness. Must be comfortable filming outdoors in cold weather conditions. Prior outdoor experience preferred. 6-week commitment.',
        roleType: 'LEAD',
        location: 'Anchorage, AK',
        compensation: '$3,500/week',
        submissionDeadline: new Date('2025-10-20'),
        shootingDates: 'December 2025 - January 2026',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'EITHER',
        castingEmail: 'casting@discoveryalaska.com',
        status: 'ACTIVE'
      },
      
      // Arizona
      {
        title: 'Background Actors - Western Film',
        production: 'Warner Bros Pictures',
        description: 'Seeking background actors for major studio Western film shooting in Arizona. Multiple roles available: saloon patrons, townspeople, ranch hands. Authentic period look required. Must be available for full shoot dates.',
        roleType: 'BACKGROUND',
        location: 'Phoenix, AZ',
        compensation: '$150/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 20 - December 15, 2025',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'extras@wbcasting.com',
        status: 'ACTIVE'
      },
      
      // Arkansas
      {
        title: 'Print Ad Campaign - Local Furniture Store',
        production: 'Arkansas Furniture Co',
        description: 'Seeking family for print advertising campaign for Arkansas furniture retailer. Looking for warm, authentic family dynamic. Photos will be used in catalogs and online. One-day shoot.',
        roleType: 'LEAD',
        location: 'Little Rock, AR',
        compensation: '$500/person',
        submissionDeadline: new Date('2025-10-20'),
        shootingDates: 'October 28, 2025',
        ageRangeMin: 25,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'marketing@arfurniture.com',
        status: 'ACTIVE'
      },
      
      // California
      {
        title: 'Co-Star - Network Medical Drama',
        production: 'ABC Studios',
        description: 'Casting co-star role for established network medical drama. Character is a patient with compelling backstory. Strong emotional range required. Shoots in Los Angeles. SAG rates apply.',
        roleType: 'CO_STAR',
        location: 'Los Angeles, CA',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 12-14, 2025',
        ageRangeMin: 30,
        ageRangeMax: 50,
        gender: 'FEMALE',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@abcstudios.com',
        status: 'ACTIVE'
      },
      
      // Colorado
      {
        title: 'Outdoor Recreation Commercial - REI',
        production: 'REI Marketing',
        description: 'National commercial for outdoor retailer. Seeking adventurous types comfortable with hiking, camping, outdoor activities. Must be genuinely active outdoors. Multiple roles available. Shooting in Colorado mountains.',
        roleType: 'LEAD',
        location: 'Denver, CO',
        compensation: '$2,000/day',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 8-10, 2025',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@rei.com',
        status: 'ACTIVE'
      },
      
      // Connecticut
      {
        title: 'Regional Theater - A Christmas Carol',
        production: 'Hartford Stage Company',
        description: 'Casting multiple roles for holiday production of A Christmas Carol at regional theater. Seeking actors for ensemble and featured roles. Strong singing voice preferred. Runs November-December.',
        roleType: 'SUPPORTING',
        location: 'Hartford, CT',
        compensation: '$600-800/week',
        submissionDeadline: new Date('2025-10-20'),
        shootingDates: 'November 22 - December 28, 2025',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'EQUITY',
        castingEmail: 'auditions@hartfordstage.org',
        status: 'ACTIVE'
      },
      
      // Delaware
      {
        title: 'Student Film - Coming of Age Drama',
        production: 'University of Delaware Film Program',
        description: 'University of Delaware thesis film seeking lead actors for coming-of-age story. Non-paid but meals provided, copy for reel, and IMDb credit. Great opportunity for emerging actors.',
        roleType: 'LEAD',
        location: 'Wilmington, DE',
        compensation: 'Copy/Credit/Meals',
        submissionDeadline: new Date('2025-10-30'),
        shootingDates: 'November 15-17, 2025',
        ageRangeMin: 16,
        ageRangeMax: 22,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'film@udel.edu',
        status: 'ACTIVE'
      },
      
      // Florida
      {
        title: 'Theme Park Live Show Performers',
        production: 'Universal Orlando Resort',
        description: 'Orlando theme park seeking performers for new live show. Must have strong singing/dancing background. Character acting skills a plus. Six-month contract with possibility of extension.',
        roleType: 'LEAD',
        location: 'Orlando, FL',
        compensation: '$750/week',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'January - July 2026',
        ageRangeMin: 18,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'EITHER',
        castingEmail: 'entertainment@universal.com',
        status: 'ACTIVE'
      },
      
      // Georgia
      {
        title: 'Recurring Role - Cable TV Series',
        production: 'FX Productions',
        description: 'Casting recurring character for second season of cable drama series. Character appears in 6 episodes. Strong dramatic chops required. Atlanta-based production.',
        roleType: 'SUPPORTING',
        location: 'Atlanta, GA',
        compensation: '$3,000/episode',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'December 2025 - February 2026',
        ageRangeMin: 28,
        ageRangeMax: 42,
        gender: 'MALE',
        ethnicity: 'BLACK',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@fxatlanta.com',
        status: 'ACTIVE'
      },
      
      // Hawaii
      {
        title: 'Travel Commercial - Hawaiian Airlines',
        production: 'Hawaiian Airlines Marketing',
        description: 'Seeking locals and visitors for Hawaiian Airlines commercial. Looking for diverse, authentic people enjoying Hawaii. Beach scenes, family moments. Shoots on Oahu.',
        roleType: 'BACKGROUND',
        location: 'Honolulu, HI',
        compensation: '$1,500/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 18-20, 2025',
        ageRangeMin: 8,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'commercial@hawaiianair.com',
        status: 'ACTIVE'
      },
      
      // Idaho
      {
        title: 'Independent Feature - Rural Drama',
        production: 'Boise Film Collective',
        description: 'Low-budget independent feature about potato farming family in Idaho. Seeking authentic actors who understand rural life. Multiple supporting roles available.',
        roleType: 'SUPPORTING',
        location: 'Boise, ID',
        compensation: '$125/day + meals',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 5-20, 2025',
        ageRangeMin: 30,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'WHITE',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@boisefilms.com',
        status: 'ACTIVE'
      },
      
      // Illinois
      {
        title: 'Guest Star - Chicago Fire',
        production: 'Wolf Entertainment',
        description: 'Dick Wolf production seeking guest star for Chicago Fire episode. Character is fire victim with powerful arc. Must be available for table read and 5 shoot days.',
        roleType: 'GUEST_STAR',
        location: 'Chicago, IL',
        compensation: 'SAG Scale + 10%',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 10-17, 2025',
        ageRangeMin: 25,
        ageRangeMax: 40,
        gender: 'FEMALE',
        ethnicity: 'LATIN',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@wolfentertainment.com',
        status: 'ACTIVE'
      },
      
      // Indiana
      {
        title: 'Local Car Dealership Commercial',
        production: 'Ray Skillman Auto Group',
        description: 'Indianapolis car dealership seeking spokesperson for local TV spots. Must be energetic, trustworthy. Will appear in multiple commercials over 6 months.',
        roleType: 'LEAD',
        location: 'Indianapolis, IN',
        compensation: '$1,000 + usage fees',
        submissionDeadline: new Date('2025-10-20'),
        shootingDates: 'November 1-2, 2025',
        ageRangeMin: 30,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'marketing@skillmanauto.com',
        status: 'ACTIVE'
      },
      
      // Iowa
      {
        title: 'Documentary Re-enactments',
        production: 'PBS Iowa',
        description: 'Historical documentary about Iowa farming needs actors for re-enactment scenes. Period: 1950s-1970s. Must be comfortable with farm animals and outdoor shooting.',
        roleType: 'SUPPORTING',
        location: 'Des Moines, IA',
        compensation: '$200/day',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'November 22-24, 2025',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'productions@iowapbs.org',
        status: 'ACTIVE'
      },
      
      // Kansas
      {
        title: 'Tornado Documentary - Weather Channel',
        production: 'Weather Channel Productions',
        description: 'Weather Channel documentary needs Kansas residents with storm-chasing experience. Looking for authentic personalities. Interviews and some re-creations.',
        roleType: 'LEAD',
        location: 'Wichita, KS',
        compensation: '$300/day',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 5-12, 2025',
        ageRangeMin: 25,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@weather.com',
        status: 'ACTIVE'
      },
      
      // Kentucky
      {
        title: 'Bourbon Distillery Brand Video',
        production: 'Makers Mark',
        description: 'Premium bourbon brand seeking actors for brand storytelling video. Looking for authentic Kentucky personalities. Will feature distillery process and heritage.',
        roleType: 'SUPPORTING',
        location: 'Louisville, KY',
        compensation: '$800/day',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 1-3, 2025',
        ageRangeMin: 35,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'marketing@makersmark.com',
        status: 'ACTIVE'
      },
      
      // Louisiana
      {
        title: 'Supporting Role - Southern Gothic Thriller',
        production: 'A24 Films',
        description: 'Major studio thriller filming in New Orleans. Seeking character actor for key supporting role. Dark, atmospheric film. 3-week shoot commitment.',
        roleType: 'SUPPORTING',
        location: 'New Orleans, LA',
        compensation: '$400/day',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'November 25 - December 15, 2025',
        ageRangeMin: 40,
        ageRangeMax: 60,
        gender: 'MALE',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@a24films.com',
        status: 'ACTIVE'
      },
      
      // Maine
      {
        title: 'L.L.Bean Lifestyle Commercial',
        production: 'L.L.Bean Marketing',
        description: 'Iconic Maine retailer seeking New England families for lifestyle commercial. Outdoor activities, cozy home scenes. Authentic Maine aesthetic required.',
        roleType: 'LEAD',
        location: 'Portland, ME',
        compensation: '$1,200/day',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 15-17, 2025',
        ageRangeMin: 5,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@llbean.com',
        status: 'ACTIVE'
      },
      
      // Maryland
      {
        title: 'Political Thriller - HBO Series',
        production: 'HBO Entertainment',
        description: 'HBO limited series about DC politics needs Baltimore-based actors for recurring roles. Multiple episodes. Must be available for extended shoot.',
        roleType: 'SUPPORTING',
        location: 'Baltimore, MD',
        compensation: '$2,500/episode',
        submissionDeadline: new Date('2025-11-15'),
        shootingDates: 'December 2025 - March 2026',
        ageRangeMin: 30,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@hbo.com',
        status: 'ACTIVE'
      },
      
      // Massachusetts
      {
        title: 'Period Drama - Boston Setting',
        production: 'Boston Film Co',
        description: 'Independent feature set in 1970s Boston. Seeking actors with authentic Boston accent. Story about working-class Irish family. Multiple supporting roles.',
        roleType: 'SUPPORTING',
        location: 'Boston, MA',
        compensation: '$200/day',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - January 2026',
        ageRangeMin: 25,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'WHITE',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@bostonfilmco.com',
        status: 'ACTIVE'
      },
      
      // Michigan
      {
        title: 'Automotive Industry Documentary',
        production: 'Netflix Documentary Films',
        description: 'Major streaming platform documentary about Detroit auto industry. Seeking current/former auto workers for interviews and reenactments.',
        roleType: 'SUPPORTING',
        location: 'Detroit, MI',
        compensation: '$350/day',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 8-15, 2025',
        ageRangeMin: 30,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'docs@netflix.com',
        status: 'ACTIVE'
      },
      
      // Minnesota
      {
        title: 'Regional Bank Commercial Campaign',
        production: 'US Bank Marketing',
        description: 'Twin Cities bank seeking diverse families and individuals for year-long commercial campaign. Multiple shoots. Looking for warm, trustworthy personalities.',
        roleType: 'LEAD',
        location: 'Minneapolis, MN',
        compensation: '$1,000/day + residuals',
        submissionDeadline: new Date('2025-10-20'),
        shootingDates: 'November 2025 - January 2026',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'marketing@usbank.com',
        status: 'ACTIVE'
      },
      
      // Mississippi
      {
        title: 'Civil Rights Era Drama',
        production: 'Participant Media',
        description: 'Historical drama about 1960s Mississippi. Seeking actors for multiple roles. Powerful, important story. Some roles require Southern accent.',
        roleType: 'SUPPORTING',
        location: 'Jackson, MS',
        compensation: '$175/day',
        submissionDeadline: new Date('2025-11-25'),
        shootingDates: 'December 15, 2025 - January 30, 2026',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@participant.com',
        status: 'ACTIVE'
      },
      
      // Missouri
      {
        title: 'Hallmark Christmas Movie',
        production: 'Hallmark Productions',
        description: 'Hallmark Channel holiday movie filming in Kansas City. Seeking supporting actors and background for small-town Christmas story. Family-friendly production.',
        roleType: 'SUPPORTING',
        location: 'Kansas City, MO',
        compensation: '$150/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 18 - December 5, 2025',
        ageRangeMin: 18,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@hallmark.com',
        status: 'ACTIVE'
      },
      
      // Montana
      {
        title: 'Yellowstone Prequel Series',
        production: '101 Studios',
        description: 'Taylor Sheridan production seeking Montana locals for new series. Looking for authentic ranchers, cowboys. Must be comfortable with horses and livestock.',
        roleType: 'SUPPORTING',
        location: 'Billings, MT',
        compensation: '$500-800/day',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - April 2026',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@101studios.com',
        status: 'ACTIVE'
      },
      
      // Nebraska
      {
        title: 'College Football Documentary',
        production: 'ESPN Films',
        description: 'ESPN documentary about Nebraska college football culture. Seeking fans, former players, community members for interviews.',
        roleType: 'SUPPORTING',
        location: 'Omaha, NE',
        compensation: '$250/day',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 10-15, 2025',
        ageRangeMin: 18,
        ageRangeMax: 75,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'films@espn.com',
        status: 'ACTIVE'
      },
      
      // Nevada
      {
        title: 'Casino Heist Film - Supporting Roles',
        production: 'MGM Studios',
        description: 'Major studio heist film set in Las Vegas. Seeking character actors for casino employees, security, patrons. Multiple day players needed.',
        roleType: 'SUPPORTING',
        location: 'Las Vegas, NV',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 20 - December 20, 2025',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@mgm.com',
        status: 'ACTIVE'
      },
      
      // New Hampshire
      {
        title: 'Horror Short Film',
        production: 'NH Film Collective',
        description: 'Low-budget horror short filming in New Hampshire woods. Seeking actors comfortable with horror genre. Great for reel building. Copy/credit/meals provided.',
        roleType: 'LEAD',
        location: 'Manchester, NH',
        compensation: 'Copy/Credit/Meals',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 8-10, 2025',
        ageRangeMin: 18,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'films@nhcollective.com',
        status: 'ACTIVE'
      },
      
      // New Jersey
      {
        title: 'Pharmaceutical Commercial',
        production: 'Johnson & Johnson',
        description: 'National pharmaceutical commercial shooting in NJ. Seeking diverse actors for lifestyle scenes. Must convey warmth and authenticity.',
        roleType: 'LEAD',
        location: 'Newark, NJ',
        compensation: '$2,500/day + residuals',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 12-13, 2025',
        ageRangeMin: 40,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@jnj.com',
        status: 'ACTIVE'
      },
      
      // New Mexico
      {
        title: 'Netflix Series - Breaking Bad Universe',
        production: 'Sony Pictures Television',
        description: 'New series in Breaking Bad universe. Seeking New Mexico locals for recurring and day player roles. Multiple opportunities throughout season.',
        roleType: 'SUPPORTING',
        location: 'Albuquerque, NM',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - March 2026',
        ageRangeMin: 18,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@sonypictures.com',
        status: 'ACTIVE'
      },
      
      // New York
      {
        title: 'Law & Order: SVU - Guest Star',
        production: 'Wolf Entertainment',
        description: 'Dick Wolf production casting guest star role for SVU episode. Strong dramatic range required. 5-day shoot commitment.',
        roleType: 'GUEST_STAR',
        location: 'New York City, NY',
        compensation: 'SAG Scale + 10%',
        submissionDeadline: new Date('2025-10-22'),
        shootingDates: 'November 5-12, 2025',
        ageRangeMin: 30,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'svu@wolfent.com',
        status: 'ACTIVE'
      },
      
      // North Carolina
      {
        title: 'Netflix Feature - Teen Drama',
        production: 'Netflix Films',
        description: 'Netflix coming-of-age drama filming in Charlotte. Seeking teen actors for supporting roles. Story about high school basketball team.',
        roleType: 'SUPPORTING',
        location: 'Charlotte, NC',
        compensation: '$250/day',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'November 25, 2025 - January 15, 2026',
        ageRangeMin: 14,
        ageRangeMax: 18,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'films@netflix.com',
        status: 'ACTIVE'
      },
      
      // North Dakota
      {
        title: 'Oil Industry Documentary',
        production: 'Vice Media',
        description: 'Documentary about North Dakota oil boom. Seeking oil workers, local residents for interviews and reenactments. Authentic stories needed.',
        roleType: 'SUPPORTING',
        location: 'Fargo, ND',
        compensation: '$300/day',
        submissionDeadline: new Date('2025-10-30'),
        shootingDates: 'November 15-20, 2025',
        ageRangeMin: 25,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'docs@vice.com',
        status: 'ACTIVE'
      },
      
      // Ohio
      {
        title: 'Marvel Studios Production',
        production: 'Marvel Studios',
        description: 'Major Marvel Studios project filming in Cleveland. Seeking background actors and featured extras. Sci-fi/action film. Multiple shoot days available.',
        roleType: 'BACKGROUND',
        location: 'Cleveland, OH',
        compensation: '$150-300/day',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - February 2026',
        ageRangeMin: 18,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'extras@marvel.com',
        status: 'ACTIVE'
      },
      
      // Oklahoma
      {
        title: 'Killers of the Flower Moon Follow-up',
        production: 'Apple Studios',
        description: 'Apple TV+ limited series about Oklahoma history. Seeking Native American actors for authentic representation. Multiple roles available.',
        roleType: 'SUPPORTING',
        location: 'Oklahoma City, OK',
        compensation: '$400/day',
        submissionDeadline: new Date('2025-11-15'),
        shootingDates: 'December 10, 2025 - March 30, 2026',
        ageRangeMin: 20,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'NATIVE_AMERICAN',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@apple.com',
        status: 'ACTIVE'
      },
      
      // Oregon
      {
        title: 'Nike Commercial - Athletes',
        production: 'Nike Inc',
        description: 'Nike seeking athletes for inspirational commercial campaign. Must be actively involved in sports. Shooting in Portland area.',
        roleType: 'LEAD',
        location: 'Portland, OR',
        compensation: '$2,000/day',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'November 22-24, 2025',
        ageRangeMin: 16,
        ageRangeMax: 35,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@nike.com',
        status: 'ACTIVE'
      },
      
      // Pennsylvania
      {
        title: 'M. Night Shyamalan Film',
        production: 'Blinding Edge Pictures',
        description: 'New thriller from M. Night Shyamalan filming in Philadelphia. Seeking actors for supporting roles. Must be available for multiple weeks.',
        roleType: 'SUPPORTING',
        location: 'Philadelphia, PA',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 15, 2025 - January 31, 2026',
        ageRangeMin: 25,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@blindingedge.com',
        status: 'ACTIVE'
      },
      
      // Rhode Island
      {
        title: 'Coastal Drama - Independent Film',
        production: 'Ocean State Films',
        description: 'Independent feature about Rhode Island fishing community. Seeking local actors with New England authenticity. Character-driven drama.',
        roleType: 'SUPPORTING',
        location: 'Providence, RI',
        compensation: '$150/day',
        submissionDeadline: new Date('2025-11-15'),
        shootingDates: 'December 5-20, 2025',
        ageRangeMin: 30,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@oceanstatefilms.com',
        status: 'ACTIVE'
      },
      
      // South Carolina
      {
        title: 'Outer Banks Season 5',
        production: 'Netflix Series',
        description: 'Netflix hit series casting Charleston locals for Season 5. Multiple roles available throughout season. Teens and young adults.',
        roleType: 'SUPPORTING',
        location: 'Charleston, SC',
        compensation: '$200-400/day',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - April 2026',
        ageRangeMin: 16,
        ageRangeMax: 30,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'obx@netflix.com',
        status: 'ACTIVE'
      },
      
      // South Dakota
      {
        title: 'Mount Rushmore Tourism Commercial',
        production: 'SD Tourism Board',
        description: 'South Dakota tourism board commercial. Seeking families and individuals enjoying SD attractions. Wholesome, adventurous vibe.',
        roleType: 'LEAD',
        location: 'Sioux Falls, SD',
        compensation: '$800/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 18-21, 2025',
        ageRangeMin: 5,
        ageRangeMax: 60,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'tourism@sd.gov',
        status: 'ACTIVE'
      },
      
      // Tennessee
      {
        title: 'Country Music Drama Series',
        production: 'CMT Productions',
        description: 'CMT original series about Nashville music scene. Seeking actors who can sing. Multiple recurring roles throughout Season 1.',
        roleType: 'SUPPORTING',
        location: 'Nashville, TN',
        compensation: '$1,000-2,000/episode',
        submissionDeadline: new Date('2025-11-20'),
        shootingDates: 'December 10, 2025 - March 15, 2026',
        ageRangeMin: 22,
        ageRangeMax: 40,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@cmt.com',
        status: 'ACTIVE'
      },
      
      // Texas
      {
        title: 'Friday Night Lights Reboot',
        production: 'Universal Television',
        description: 'New series inspired by FNL universe. Seeking Texas actors for high school football drama. Multiple leads and supporting roles.',
        roleType: 'LEAD',
        location: 'Austin, TX',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - April 2026',
        ageRangeMin: 14,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'fnl@universal.com',
        status: 'ACTIVE'
      },
      
      // Utah
      {
        title: 'Sundance Film Festival Short',
        production: 'Sundance Institute',
        description: 'Award-winning director\'s new short film. Seeking actors for character-driven drama. Will premiere at Sundance. Great for reel.',
        roleType: 'LEAD',
        location: 'Salt Lake City, UT',
        compensation: '$200/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 20-25, 2025',
        ageRangeMin: 25,
        ageRangeMax: 40,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'labs@sundance.org',
        status: 'ACTIVE'
      },
      
      // Vermont
      {
        title: 'Ben & Jerry\'s Brand Campaign',
        production: 'Ben & Jerry\'s Marketing',
        description: 'Ben & Jerry\'s seeking Vermont locals for brand storytelling campaign. Authentic Vermont personalities. Multiple commercials and online content.',
        roleType: 'LEAD',
        location: 'Burlington, VT',
        compensation: '$1,000/day',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 15-20, 2025',
        ageRangeMin: 18,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@benjerry.com',
        status: 'ACTIVE'
      },
      
      // Virginia
      {
        title: 'Military Drama - Pentagon Story',
        production: 'CBS Studios',
        description: 'CBS drama about Pentagon staff. Seeking actors for recurring roles. Military experience or knowledge a plus. Virginia Beach area.',
        roleType: 'SUPPORTING',
        location: 'Virginia Beach, VA',
        compensation: '$800/day',
        submissionDeadline: new Date('2025-11-15'),
        shootingDates: 'December 5, 2025 - March 31, 2026',
        ageRangeMin: 28,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@cbs.com',
        status: 'ACTIVE'
      },
      
      // Washington
      {
        title: 'Amazon Studios Series',
        production: 'Amazon Studios',
        description: 'New Amazon limited series filming in Seattle. Tech industry drama. Seeking actors for supporting roles. 8-episode commitment.',
        roleType: 'SUPPORTING',
        location: 'Seattle, WA',
        compensation: '$2,000/episode',
        submissionDeadline: new Date('2025-11-25'),
        shootingDates: 'December 15, 2025 - April 30, 2026',
        ageRangeMin: 25,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ASIAN',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@amazon.com',
        status: 'ACTIVE'
      },
      
      // West Virginia
      {
        title: 'Appalachian Documentary',
        production: 'PBS America',
        description: 'Documentary about modern Appalachian life. Seeking West Virginia residents to tell their stories. Authentic voices needed.',
        roleType: 'SUPPORTING',
        location: 'Charleston, WV',
        compensation: '$250/day',
        submissionDeadline: new Date('2025-10-28'),
        shootingDates: 'November 10-20, 2025',
        ageRangeMin: 18,
        ageRangeMax: 75,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'docs@pbs.org',
        status: 'ACTIVE'
      },
      
      // Wisconsin
      {
        title: 'Harley-Davidson Brand Documentary',
        production: 'Harley-Davidson Motor Company',
        description: 'Harley-Davidson documentary about motorcycle culture. Seeking riders and enthusiasts in Milwaukee area. Authentic personalities.',
        roleType: 'SUPPORTING',
        location: 'Milwaukee, WI',
        compensation: '$300/day',
        submissionDeadline: new Date('2025-11-01'),
        shootingDates: 'November 20 - December 5, 2025',
        ageRangeMin: 25,
        ageRangeMax: 65,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'marketing@harley-davidson.com',
        status: 'ACTIVE'
      },
      
      // Wyoming
      {
        title: 'National Parks Documentary Series',
        production: 'PBS Nature',
        description: 'PBS documentary series about Yellowstone and Grand Teton. Seeking park rangers, locals, visitors for interviews and reenactments.',
        roleType: 'SUPPORTING',
        location: 'Cheyenne, WY',
        compensation: '$300/day',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'November 25 - December 10, 2025',
        ageRangeMin: 20,
        ageRangeMax: 70,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'nature@pbs.org',
        status: 'ACTIVE'
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
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
