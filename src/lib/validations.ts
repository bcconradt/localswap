import { z } from 'zod'

// Auth validations
export const sendCodeSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
})

export const verifyCodeSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  code: z.string().length(6, 'Code must be 6 digits'),
})

// Profile validations
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  neighborhood: z.string().max(100).optional(),
  notificationsEnabled: z.boolean().optional(),
  locationSharingEnabled: z.boolean().optional(),
})

// Location validations
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().min(1).max(100),
  neighborhood: z.string().max(100).optional(),
  radiusMiles: z.number().min(1).max(50).default(10),
  type: z.enum(['home', 'traveler']).default('home'),
})

// Traveler validations
export const travelerProfileSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().min(1).max(100),
  neighborhood: z.string().max(100).optional(),
  radiusMiles: z.number().min(1).max(50).default(10),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  availabilityWindows: z.array(z.object({
    day: z.string(),
    start: z.string(),
    end: z.string(),
  })).optional(),
})

// Listing validations
export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  category: z.enum([
    'household', 'kids', 'electronics', 'clothing', 'books',
    'sports', 'tools', 'garden', 'services', 'other'
  ]),
  subcategory: z.string().max(50).optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'for_parts']).optional(),
  isService: z.boolean().default(false),
  wantsType: z.enum(['open', 'categories', 'specific']).default('open'),
  wantsCategories: z.array(z.string()).optional(),
  wantsDescription: z.string().max(500).optional(),
  availability: z.array(z.object({
    day: z.string(),
    timeOfDay: z.string(),
  })).optional(),
  preferredMeetupArea: z.string().max(200).optional(),
})

export const updateListingSchema = createListingSchema.partial()

export const listingSearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(100).default(10),
  category: z.string().optional(),
  condition: z.string().optional(),
  isService: z.coerce.boolean().optional(),
  includeTravelers: z.coerce.boolean().default(true),
  sort: z.enum(['recent', 'distance', 'relevance']).default('recent'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  q: z.string().optional(), // Search query
})

// Offer validations
export const createOfferSchema = z.object({
  listingId: z.string().cuid(),
  message: z.string().max(500).optional(),
  items: z.array(z.object({
    listingId: z.string().cuid().optional(),
    description: z.string().max(500).optional(),
    photoUrl: z.string().url().optional(),
  })).min(1, 'Must offer at least one item'),
})

export const counterOfferSchema = z.object({
  message: z.string().max(500).optional(),
  items: z.array(z.object({
    listingId: z.string().cuid().optional(),
    description: z.string().max(500).optional(),
    photoUrl: z.string().url().optional(),
  })).min(1, 'Must offer at least one item'),
})

export const scheduleMeetupSchema = z.object({
  location: z.string().min(1).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  time: z.string().transform((s) => new Date(s)),
})

// Message validations
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'offer_card', 'image', 'system']).default('text'),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Review validations
export const createReviewSchema = z.object({
  offerId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional(),
  comment: z.string().max(1000).optional(),
})

// Report validations
export const createReportSchema = z.object({
  reportedUserId: z.string().cuid(),
  reportedListingId: z.string().cuid().optional(),
  offerId: z.string().cuid().optional(),
  reason: z.enum([
    'no_show', 'not_as_described', 'scam',
    'harassment', 'inappropriate_content', 'other'
  ]),
  description: z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).optional(),
})

// Block validations
export const blockUserSchema = z.object({
  blockedId: z.string().cuid(),
})

// Notification validations
export const notificationListSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  unreadOnly: z.coerce.boolean().default(false),
})

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()),
})

export const deleteNotificationsSchema = z.object({
  notificationIds: z.array(z.string().cuid()),
})

// Notification settings validations
export const updateNotificationSettingsSchema = z.object({
  globalEnabled: z.boolean().optional(),
  offerReceived: z.boolean().optional(),
  offerAccepted: z.boolean().optional(),
  offerDeclined: z.boolean().optional(),
  offerCountered: z.boolean().optional(),
  offerExpired: z.boolean().optional(),
  messageReceived: z.boolean().optional(),
  reviewReceived: z.boolean().optional(),
  tradeCompleted: z.boolean().optional(),
  newListingMatch: z.boolean().optional(),
  interestDelivery: z.enum(['immediate', 'daily_digest']).optional(),
  dailyEncouragement: z.boolean().optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    timezone: z.string(),
  }).optional(),
})

// Interest validations
export const addInterestSchema = z.object({
  category: z.enum([
    'household', 'kids', 'electronics', 'clothing', 'books',
    'sports', 'tools', 'garden', 'services', 'other'
  ]),
  keywords: z.array(z.string().max(50)).max(10).optional(),
  radiusMiles: z.number().min(1).max(100).optional(),
})

export const replaceInterestsSchema = z.object({
  interests: z.array(z.object({
    category: z.enum([
      'household', 'kids', 'electronics', 'clothing', 'books',
      'sports', 'tools', 'garden', 'services', 'other'
    ]),
    keywords: z.array(z.string().max(50)).max(10).optional(),
    radiusMiles: z.number().min(1).max(100).optional(),
  })),
})
