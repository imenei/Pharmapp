const LAUNCH_PROMO_END = new Date('2026-05-24T23:59:59.999Z');

export function getTrialDaysForDate(baseDate: Date) {
  return baseDate <= LAUNCH_PROMO_END ? 30 : 7;
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
