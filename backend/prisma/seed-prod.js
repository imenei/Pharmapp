// prisma/seed-prod.js — runs in production (no ts-node needed)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Admin user
  const hash = await bcrypt.hash('Ned@\'0820', 10);
  await prisma.user.upsert({
    where: { email: 'Khemissisonia08@gmail.com' },
    update: {},
    create: {
      email: 'Khemissisonia08@gmail.com',
      passwordHash: hash,
      role: 'admin',
      status: 'approved',
      isActive: true,
      profile: { create: { companyName: 'Pharma Flow Admin', wilaya: 'Alger' } },
    },
  });

  // Plans
  const plans = [
    { id: 'plan-gold', name: 'Or', tier: 'gold', price: 25000, yearlyPrice: 300000, durationDays: 30, features: ["Priorité maximale dans les résultats","Mise à jour quotidienne des listings","Notifications immédiates aux pharmaciens","Annonces sur la page d'accueil","Support VIP 24/7"] },
    { id: 'plan-silver', name: 'Argent', tier: 'silver', price: 15000, yearlyPrice: 180000, durationDays: 30, features: ["Mise en avant dans les résultats","Notifications aux pharmaciens","Support prioritaire","Statistiques avancées"] },
    { id: 'plan-bronze', name: 'Bronze', tier: 'bronze', price: 10000, yearlyPrice: 120000, durationDays: 30, features: ["Visibilité dans les résultats","Premier mois de lancement offert","Fonctionnalités de base","Support standard"] },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // Wilayas
  const wilayas = [
    {code:1,nom:'Adrar'},{code:2,nom:'Chlef'},{code:3,nom:'Laghouat'},{code:4,nom:'Oum El Bouaghi'},
    {code:5,nom:'Batna'},{code:6,nom:'Béjaïa'},{code:7,nom:'Biskra'},{code:8,nom:'Béchar'},
    {code:9,nom:'Blida'},{code:10,nom:'Bouira'},{code:11,nom:'Tamanrasset'},{code:12,nom:'Tébessa'},
    {code:13,nom:'Tlemcen'},{code:14,nom:'Tiaret'},{code:15,nom:'Tizi Ouzou'},{code:16,nom:'Alger'},
    {code:17,nom:'Djelfa'},{code:18,nom:'Jijel'},{code:19,nom:'Sétif'},{code:20,nom:'Saïda'},
    {code:21,nom:'Skikda'},{code:22,nom:'Sidi Bel Abbès'},{code:23,nom:'Annaba'},{code:24,nom:'Guelma'},
    {code:25,nom:'Constantine'},{code:26,nom:'Médéa'},{code:27,nom:'Mostaganem'},{code:28,nom:'Msila'},
    {code:29,nom:'Mascara'},{code:30,nom:'Ouargla'},{code:31,nom:'Oran'},{code:32,nom:'El Bayadh'},
    {code:33,nom:'Illizi'},{code:34,nom:'Bordj Bou Arreridj'},{code:35,nom:'Boumerdès'},{code:36,nom:'El Tarf'},
    {code:37,nom:'Tindouf'},{code:38,nom:'Tissemsilt'},{code:39,nom:'El Oued'},{code:40,nom:'Khenchela'},
    {code:41,nom:'Souk Ahras'},{code:42,nom:'Tipaza'},{code:43,nom:'Mila'},{code:44,nom:'Aïn Defla'},
    {code:45,nom:'Naâma'},{code:46,nom:'Aïn Témouchent'},{code:47,nom:'Ghardaïa'},{code:48,nom:'Relizane'},
    {code:49,nom:'Timimoun'},{code:50,nom:'Bordj Badji Mokhtar'},{code:51,nom:'Ouled Djellal'},{code:52,nom:'Béni Abbès'},
    {code:53,nom:'In Salah'},{code:54,nom:'In Guezzam'},{code:55,nom:'Touggourt'},{code:56,nom:'Djanet'},
    {code:57,nom:"El M'Ghair"},{code:58,nom:'El Meniaa'},
  ];
  for (const w of wilayas) {
    await prisma.wilaya.upsert({ where: { code: w.code }, update: { nom: w.nom }, create: w });
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
