'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'cgu' | 'privacy'>('cgu');

  return (
    <div className="min-h-screen bg-[#E8F5E9]">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-[#2E7D32]">PHARMA FLOW</span>
          </Link>
          <Link href="/auth/signin" className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20]">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">Informations legales</h1>

        <div className="mx-auto mb-10 flex max-w-sm rounded-xl bg-gray-100 p-1">
          {([
            ['cgu', "Conditions d'utilisation"],
            ['privacy', 'Confidentialite'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                activeTab === key ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-600 hover:text-[#2E7D32]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="prose prose-lg max-w-none rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {activeTab === 'cgu' ? (
            <>
              <h2 className="mt-0 text-2xl font-semibold text-[#2E7D32]">Conditions d&apos;utilisation</h2>
              <p className="text-gray-600">
                Bienvenue sur Pharma Flow. En utilisant notre plateforme, vous acceptez ces conditions d&apos;utilisation.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">1. Acceptation des conditions</h3>
              <p className="text-gray-600">
                En accedant a ou en utilisant Pharma Flow, vous acceptez d&apos;etre lie par ces conditions.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">2. Eligibilite</h3>
              <p className="text-gray-600">
                Pour utiliser notre plateforme, vous devez etre un professionnel du secteur pharmaceutique en Algerie, soit en tant que pharmacien, soit en tant que fournisseur.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">3. Compte utilisateur</h3>
              <p className="text-gray-600">
                Vous etes responsable de la confidentialite de vos informations de connexion et de toutes les activites qui se produisent sous votre compte.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">4. Contenu et conduite</h3>
              <p className="text-gray-600">
                Vous acceptez de ne pas publier de contenu faux, trompeur ou illegal. Pharma Flow se reserve le droit de supprimer tout contenu violant ces conditions.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">5. Abonnements et paiements</h3>
              <p className="text-gray-600">
                Les abonnements sont soumis aux tarifs affiches sur la plateforme. Les paiements sont effectues par virement bancaire et doivent etre accompagnes d&apos;une preuve de paiement.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">6. Limitation de responsabilite</h3>
              <p className="text-gray-600">
                Pharma Flow agit en tant qu&apos;intermediaire entre pharmaciens et fournisseurs. Les transactions commerciales relevent de la responsabilite des utilisateurs.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">7. Modifications</h3>
              <p className="text-gray-600">
                Pharma Flow se reserve le droit de modifier ces conditions a tout moment.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-0 text-2xl font-semibold text-[#2E7D32]">Politique de confidentialite</h2>
              <p className="text-gray-600">
                Votre vie privee est importante pour nous. Cette politique explique comment Pharma Flow collecte, utilise et protege vos informations personnelles.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">1. Donnees collectees</h3>
              <p className="text-gray-600">
                Nous collectons les informations que vous nous fournissez lors de l&apos;inscription ainsi que les donnees d&apos;utilisation de la plateforme.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">2. Utilisation des donnees</h3>
              <p className="text-gray-600">
                Vos donnees sont utilisees pour fournir et ameliorer nos services, traiter vos paiements et vous envoyer des notifications pertinentes.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">3. Protection des donnees</h3>
              <p className="text-gray-600">
                Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos informations contre tout acces non autorise.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">4. Partage des donnees</h3>
              <p className="text-gray-600">
                Nous ne vendons pas vos donnees personnelles a des tiers. Les informations de profil visibles sont accessibles aux autres utilisateurs approuves de la plateforme.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">5. Vos droits</h3>
              <p className="text-gray-600">
                Vous avez le droit d&apos;acceder a vos donnees, de les corriger ou de demander leur suppression. Pour exercer ces droits, contactez-nous a{' '}
                <a href="mailto:contact@pharmaflowdz.com" className="text-[#2E7D32] hover:underline">contact@pharmaflowdz.com</a>.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">6. Cookies</h3>
              <p className="text-gray-600">
                Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme, notamment pour l&apos;authentification et la session.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">7. Contact</h3>
              <p className="text-gray-600">
                Pour toute question relative a la confidentialite de vos donnees, contactez-nous a{' '}
                <a href="mailto:contact@pharmaflowdz.com" className="text-[#2E7D32] hover:underline">contact@pharmaflowdz.com</a>.
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <p className="text-center text-sm text-gray-600">
          © 2025 Pharma Flow ·{' '}
          <Link href="/contact" className="transition-colors hover:text-[#2E7D32]">Nous contacter</Link>
        </p>
      </footer>
    </div>
  );
}
