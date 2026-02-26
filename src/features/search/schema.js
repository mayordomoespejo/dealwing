import { z } from 'zod'

const today = () => new Date().toISOString().slice(0, 10)

export const searchSchema = z
  .object({
    tripType: z.enum(['one-way', 'round-trip']),
    origin: z
      .string()
      .length(3, 'Must be a 3-letter IATA code')
      .regex(/^[A-Z]{3}$/, 'Must be uppercase IATA code (e.g. MAD)'),
    destination: z
      .string()
      .length(3, 'Must be a 3-letter IATA code')
      .regex(/^[A-Z]{3}$/, 'Must be uppercase IATA code (e.g. JFK)')
      .optional()
      .or(z.literal('')),
    departureDate: z
      .string()
      .min(1, 'Departure date is required')
      .refine(val => val >= today(), 'Date cannot be in the past'),
    returnDate: z.string().optional().or(z.literal('')),
    adults: z.number().int().min(1).max(9),
    currency: z.enum(['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF']),
  })
  .refine(
    data => {
      if (data.tripType === 'round-trip' && !data.returnDate) return false
      return true
    },
    { message: 'Return date is required for round-trip', path: ['returnDate'] }
  )
  .refine(
    data => {
      if (data.returnDate && data.departureDate && data.returnDate < data.departureDate)
        return false
      return true
    },
    { message: 'Return date must be after departure date', path: ['returnDate'] }
  )

export const defaultValues = {
  tripType: 'round-trip',
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  adults: 1,
  currency: 'EUR',
}
