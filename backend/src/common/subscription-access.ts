export const LAUNCH_PROMO_END = new Date('2026-05-31T23:59:59.999Z');
export const FIRST_SUBSCRIPTION_TRIAL_DAYS = 7;

export function isLaunchPromoActive(now = new Date()) {
  return now <= LAUNCH_PROMO_END;
}

export function getTrialDaysForDate(_baseDate: Date) {
  return FIRST_SUBSCRIPTION_TRIAL_DAYS;
}

export function getTrialEndDate(baseDate: Date) {
  const end = new Date(baseDate);
  end.setDate(end.getDate() + getTrialDaysForDate(baseDate));
  return end;
}

export function isTrialActiveFromDate(baseDate?: Date | null, now = new Date()) {
  if (!baseDate) return false;
  return getTrialEndDate(baseDate) >= now;
}

export function isSupplierFreeAccessActive(firstSubscriptionCreatedAt?: Date | null, now = new Date()) {
  if (isLaunchPromoActive(now)) return true;
  return isTrialActiveFromDate(firstSubscriptionCreatedAt, now);
}
