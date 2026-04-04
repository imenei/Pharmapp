// src/app/auth/signup-success/page.tsx
import Link from 'next/link';
export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscription envoyée !</h1>
        <p className="text-gray-600 mb-6">
          Votre demande a bien été reçue. Un administrateur va examiner votre dossier.
          Vous recevrez une notification dès l&apos;approbation de votre compte.
        </p>
        <Link href="/auth/signin" className="btn-primary w-full py-3 block">Retour à la connexion</Link>
      </div>
    </div>
  );
}
