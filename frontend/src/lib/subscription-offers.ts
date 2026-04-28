const LAUNCH_PROMO_END = new Date('2026-05-24T23:59:59.999Z');

export function getWelcomeTrialDays(now = new Date()) {
  return now <= LAUNCH_PROMO_END ? 30 : 7;
}

export function getWelcomeTrialLabel(now = new Date()) {
  return getWelcomeTrialDays(now) === 30
    ? 'Premier mois de lancement offert'
    : "7 jours d'essai offerts";
}
