import { z } from 'zod'

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Builds the search form schema with translated validation messages.
 * @param { (key: string) => string } t - i18n translate function (e.g. useTranslation().t)
 * @returns { z.ZodType } Zod schema for the search form
 */
export function getSearchSchema(t) {
  return z
    .object({
      tripType: z.enum(['one-way', 'round-trip']),
      origin: z
        .string()
        .min(1, t('search.validation.originRequired'))
        .length(3, t('search.validation.originIataLength'))
        .regex(/^[A-Z]{3}$/, t('search.validation.originIataFormat')),
      destination: z
        .string()
        .min(1, t('search.validation.destinationRequired'))
        .length(3, t('search.validation.destinationIataLength'))
        .regex(/^[A-Z]{3}$/, t('search.validation.destinationIataFormat')),
      departureDate: z
        .string()
        .min(1, t('search.validation.departureRequired'))
        .refine(val => val >= today(), t('search.validation.dateNotPast')),
      returnDate: z.string().optional().or(z.literal('')),
      adults: z
        .number()
        .int()
        .min(1, t('search.validation.adultsRange'))
        .max(9, t('search.validation.adultsRange')),
    })
    .refine(
      data => {
        if (data.tripType === 'round-trip' && !data.returnDate) return false
        return true
      },
      { message: t('search.validation.returnRequired'), path: ['returnDate'] }
    )
    .refine(
      data => {
        if (data.returnDate && data.departureDate && data.returnDate < data.departureDate)
          return false
        return true
      },
      { message: t('search.validation.returnAfterDeparture'), path: ['returnDate'] }
    )
}

export const defaultValues = {
  tripType: 'round-trip',
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  adults: 1,
}
