/**
 * SMS Service for LocalSwap
 *
 * Currently uses mock verification codes for development.
 * To enable real SMS via Twilio:
 * 1. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
 * 2. The service will automatically switch to real SMS
 */

// Check if Twilio is configured
const isTwilioConfigured = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
)

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  if (process.env.NODE_ENV === 'development' && !isTwilioConfigured) {
    // Use fixed code in development for easier testing
    return '123456'
  }
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send SMS verification code
export async function sendVerificationSMS(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  // Development mode without Twilio - just log and succeed
  if (!isTwilioConfigured) {
    console.log(`[DEV SMS] Sending code ${code} to ${phone}`)
    console.log(`[DEV SMS] Use code: ${code}`)
    return { success: true }
  }

  // Production mode with Twilio
  try {
    // Dynamic import to avoid issues when Twilio isn't installed
    const twilio = await import('twilio')
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await client.messages.create({
      body: `Your LocalSwap verification code is: ${code}. It expires in 10 minutes.`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    })

    return { success: true }
  } catch (error) {
    console.error('Twilio SMS error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    }
  }
}

// Format phone number to E.164 format
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If it starts with 1 and has 11 digits, it's already US format
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // If it has 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // Otherwise return as-is with + prefix
  return digits.startsWith('+') ? phone : `+${digits}`
}
