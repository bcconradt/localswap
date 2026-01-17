import { PrismaClient } from '../src/generated/prisma'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const dailyQuotes = [
  // Motivation
  {
    content: "One person's clutter is another person's treasure. Keep swapping!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "The best things in life aren't things—but trading for them comes close!",
    author: null,
    category: 'motivation',
  },
  {
    content: "Every swap you make reduces waste and builds community.",
    author: null,
    category: 'community',
  },
  {
    content: "Before you buy, ask yourself: could I swap for this instead?",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "Building trust one swap at a time. Your reputation is your currency.",
    author: null,
    category: 'community',
  },
  {
    content: "Sustainability isn't just a buzzword—it's a way of life. Keep swapping!",
    author: null,
    category: 'motivation',
  },
  {
    content: "The joy of swapping: getting something new while giving something purpose.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Pro tip: Great photos make your listings irresistible!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "Local swaps mean less shipping, less waiting, and more community.",
    author: null,
    category: 'community',
  },
  {
    content: "Every successful swap is a win-win. That's the beauty of trading.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Tip: Be specific about what you're looking for in return—it helps find matches!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "The sharing economy starts in your neighborhood.",
    author: null,
    category: 'community',
  },
  {
    content: "Reduce, reuse, swap. The three R's just got an upgrade.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Quick response times lead to more successful swaps!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "Your unused items could be exactly what your neighbor needs.",
    author: null,
    category: 'community',
  },
  {
    content: "Trade what you have for what you need. Simple as that.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Pro tip: Meet in public places for safe and easy exchanges.",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "Strong communities are built on trust and generosity.",
    author: null,
    category: 'community',
  },
  {
    content: "The greenest product is the one that already exists.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Keep your listings fresh—update or relist items that haven't traded yet.",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "A swap today could be the start of a lasting connection.",
    author: null,
    category: 'community',
  },
  {
    content: "Declutter your space, enrich someone else's life.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Tip: Categories matter! List items in the right category for better visibility.",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "Neighbors helping neighbors—that's what swapping is all about.",
    author: null,
    category: 'community',
  },
  {
    content: "Every item has a story. Pass it on through swapping.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Good communication makes great swaps. Always be clear about condition!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "The circular economy starts with you.",
    author: null,
    category: 'community',
  },
  {
    content: "What's sitting in your garage could make someone's day.",
    author: null,
    category: 'motivation',
  },
  {
    content: "Pro tip: Leave reviews after each swap—they help everyone!",
    author: null,
    category: 'swap_tip',
  },
  {
    content: "In a world of disposable goods, swapping is an act of rebellion.",
    author: null,
    category: 'motivation',
  },
]

async function main() {
  console.log('Seeding daily quotes...')

  // Check if quotes already exist
  const existingCount = await prisma.dailyQuote.count()
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing quotes. Skipping seed.`)
    return
  }

  // Insert quotes
  const result = await prisma.dailyQuote.createMany({
    data: dailyQuotes.map((quote) => ({
      content: quote.content,
      author: quote.author,
      category: quote.category as 'motivation' | 'swap_tip' | 'community',
      isActive: true,
    })),
  })

  console.log(`Seeded ${result.count} daily quotes.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
