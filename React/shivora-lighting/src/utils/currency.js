const CURRENCY_LOCALES = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

export function formatCurrency(
  value,
  currency = 'INR'
) {
  const safeCurrency =
    Object.prototype.hasOwnProperty.call(
      CURRENCY_LOCALES,
      currency
    )
      ? currency
      : 'INR'

  return new Intl.NumberFormat(
    CURRENCY_LOCALES[safeCurrency],
    {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(Number(value || 0))
}
