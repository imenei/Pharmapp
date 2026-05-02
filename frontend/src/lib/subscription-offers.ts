const LAUNCH_PROMO_END = new Date('2026-05-31T23:59:59.999Z');

export function getWelcomeTrialDays(now = new Date()) {
  return now <= LAUNCH_PROMO_END ? 0 : 7;
}

export function getWelcomeTrialLabel(now = new Date()) {
  return now <= LAUNCH_PROMO_END
    ? 'Mois de lancement offert a tous les fournisseurs'
    : "7 jours d'essai offerts au premier abonnement";
}
