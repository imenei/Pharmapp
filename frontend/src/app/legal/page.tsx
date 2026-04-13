'use client';
// src/app/legal/page.tsx
import { useState } from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'cgu'|'privacy'>('cgu');

  return (
    <div className="min-h-screen bg-[#E8F5E9]">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-[#2E7D32]">ELSAIDALIYA</span>
          </Link>
          <Link href="/auth/signin" className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition-colors text-sm font-medium">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Informations Légales</h1>

        {/* Tab selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-10 max-w-sm mx-auto">
          {([['cgu','Conditions d\'utilisation'],['privacy','Confidentialité']] as const).map(([key,label])=>(
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-600 hover:text-[#2E7D32]'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 prose prose-lg max-w-none">
          {activeTab === 'cgu' ? (
            <>
              <h2 className="text-2xl font-semibold text-[#2E7D32] mt-0">Conditions d&apos;Utilisation</h2>
              <p className="text-gray-600">
                Bienvenue sur Elsaidaliya. En utilisant notre plateforme, vous acceptez ces conditions d&apos;utilisation. Veuillez les lire attentivement.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">1. Acceptation des Conditions</h3>
              <p className="text-gray-600">
                En accédant à ou en utilisant Elsaidaliya, vous acceptez d&apos;être lié par ces Conditions. Si vous n&apos;acceptez pas ces Conditions, vous ne devez pas utiliser notre plateforme.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">2. Éligibilité</h3>
              <p className="text-gray-600">
                Pour utiliser notre plateforme, vous devez être un professionnel du secteur pharmaceutique en Algérie, soit en tant que pharmacien, soit en tant que fournisseur. Vous devez être légalement autorisé à exercer votre profession et posséder toutes les licences et autorisations requises par la loi algérienne.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">3. Compte Utilisateur</h3>
              <p className="text-gray-600">
                Vous êtes responsable du maintien de la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">4. Contenu et Conduite</h3>
              <p className="text-gray-600">
                Vous acceptez de ne pas publier de contenu faux, trompeur ou illégal. Les listings de produits doivent être exacts et conformes à la réglementation pharmaceutique algérienne. Elsaidaliya se réserve le droit de supprimer tout contenu violant ces conditions.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">5. Abonnements et Paiements</h3>
              <p className="text-gray-600">
                Les abonnements sont soumis aux tarifs affichés sur la plateforme. Les paiements sont effectués par virement bancaire ou CCP et doivent être accompagnés d&apos;une preuve de paiement. Les abonnements sont activés après vérification du paiement par notre équipe.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">6. Limitation de Responsabilité</h3>
              <p className="text-gray-600">
                Elsaidaliya agit en tant qu&apos;intermédiaire entre pharmaciens et fournisseurs. Nous ne sommes pas responsables des transactions commerciales effectuées entre les utilisateurs via la plateforme. La disponibilité et l&apos;exactitude des produits relèvent de la responsabilité des fournisseurs.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">7. Modifications</h3>
              <p className="text-gray-600">
                Elsaidaliya se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications importantes par email.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-[#2E7D32] mt-0">Politique de Confidentialité</h2>
              <p className="text-gray-600">
                Votre vie privée est importante pour nous. Cette politique explique comment Elsaidaliya collecte, utilise et protège vos informations personnelles.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">1. Données Collectées</h3>
              <p className="text-gray-600">
                Nous collectons les informations que vous nous fournissez lors de l&apos;inscription (nom, email, téléphone, adresse professionnelle), ainsi que les données d&apos;utilisation de la plateforme (pages visitées, téléchargements, interactions).
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">2. Utilisation des Données</h3>
              <p className="text-gray-600">
                Vos données sont utilisées pour fournir et améliorer nos services, vous contacter concernant votre compte, traiter vos paiements et abonnements, et vous envoyer des notifications pertinentes sur la plateforme.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">3. Protection des Données</h3>
              <p className="text-gray-600">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé. Vos mots de passe sont chiffrés et ne sont jamais stockés en clair.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">4. Partage des Données</h3>
              <p className="text-gray-600">
                Nous ne vendons pas vos données personnelles à des tiers. Les informations de profil visibles (nom d&apos;entreprise, wilaya, description) sont accessibles aux autres utilisateurs approuvés de la plateforme.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">5. Vos Droits</h3>
              <p className="text-gray-600">
                Vous avez le droit d&apos;accéder à vos données, de les corriger ou de demander leur suppression. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@elsaidaliya.com" className="text-[#2E7D32] hover:underline">contact@elsaidaliya.com</a>.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">6. Cookies</h3>
              <p className="text-gray-600">
                Nous utilisons des cookies essentiels pour le fonctionnement de la plateforme (authentification, session). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
              </p>

              <h3 className="text-xl font-semibold text-[#2E7D32]">7. Contact</h3>
              <p className="text-gray-600">
                Pour toute question relative à la confidentialité de vos données, contactez-nous à{' '}
                <a href="mailto:contact@elsaidaliya.com" className="text-[#2E7D32] hover:underline">contact@elsaidaliya.com</a>.
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <p className="text-center text-sm text-gray-600">
          © 2025 Elsaidaliya ·{' '}
          <Link href="/contact" className="hover:text-[#2E7D32] transition-colors">Nous contacter</Link>
        </p>
      </footer>
    </div>
  );
}
