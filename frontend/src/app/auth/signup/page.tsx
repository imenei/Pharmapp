'use client';
// src/app/auth/signup/page.tsx
// Inscription complète avec registre de commerce obligatoire + CGU
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import api from '@/lib/api';

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',
  "El M'Ghair",'El Menia',
];

export default function SignUpPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    companyName: '',
    role: 'pharmacist' as 'pharmacist' | 'supplier',
    wilaya: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [registerFile, setRegisterFile]     = useState<File | null>(null);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 MB');
      return;
    }
    setRegisterFile(file);
    setError('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas'); return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères'); return;
    }
    if (!form.termsAccepted) {
      setError("Veuillez accepter les conditions d'utilisation"); return;
    }
    if (!registerFile) {
      setError('Le registre de commerce est obligatoire'); return;
    }

    setLoading(true);
    try {
      // Build multipart/form-data — needed to send both fields + file
      const fd = new FormData();
      fd.append('email',       form.email);
      fd.append('password',    form.password);
      fd.append('role',        form.role);
      fd.append('companyName', form.companyName);
      fd.append('wilaya',      form.wilaya);
      fd.append('phone',       form.phone);
      fd.append('registerFile', registerFile); // ← file field name used by multer

      await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/auth/signup-success');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#E8F5E9] min-h-screen">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-[#2E7D32] rounded-full flex items-center justify-center mb-2">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Créer un compte professionnel</h2>
          <p className="mt-2 text-sm text-gray-600">Rejoignez la plateforme Elsaidaliya</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Raison sociale */}
            <div className="md:col-span-2">
              <label className="label">Raison sociale *</label>
              <input className="input" required placeholder="Nom de votre entreprise / pharmacie"
                value={form.companyName} onChange={e => set('companyName', e.target.value)}/>
            </div>

            {/* Rôle */}
            <div className="md:col-span-2">
              <label className="label">Rôle *</label>
              <div className="flex gap-6 mt-1">
                {(['pharmacist','supplier'] as const).map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value={r}
                      checked={form.role === r} onChange={() => set('role', r)}
                      className="h-4 w-4 text-[#2E7D32] focus:ring-[#2E7D32] border-gray-300"/>
                    <span className="text-sm text-gray-700 font-medium">
                      {r === 'pharmacist' ? '🏥 Pharmacien' : '🏭 Fournisseur'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Registre de commerce — OBLIGATOIRE */}
            <div className="md:col-span-2">
              <label className="label">Registre de commerce scanné *</label>

              {/* Warning notice */}
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5"/>
                <p className="text-sm text-yellow-700">
                  <strong>Important :</strong> Le document doit être un scan clair et lisible de votre registre de commerce officiel. Il sera vérifié par un administrateur avant l&apos;activation de votre compte.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  registerFile
                    ? 'border-[#2E7D32] bg-[#E8F5E9]'
                    : 'border-[#2E7D32] hover:bg-green-50'
                }`}>
                {registerFile ? (
                  <div className="flex items-center justify-center gap-3 text-[#2E7D32]">
                    <CheckCircle className="h-8 w-8"/>
                    <div className="text-left">
                      <p className="font-semibold">{registerFile.name}</p>
                      <p className="text-sm text-green-600">{(registerFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setRegisterFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="ml-4 text-red-500 hover:text-red-700 text-xs font-medium underline">
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="text-[#2E7D32]">
                    <Upload className="h-10 w-10 mx-auto mb-3"/>
                    <p className="font-semibold">Cliquez pour télécharger votre registre de commerce</p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG ou PDF · Max 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange} className="hidden"/>
              <p className="mt-2 text-xs text-gray-500">
                • Le document sera vérifié par un administrateur avant validation de votre compte
              </p>
            </div>

            {/* Wilaya */}
            <div>
              <label className="label">Wilaya *</label>
              <select className="input" required value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
                <option value="">Sélectionnez votre wilaya</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Téléphone */}
            <div>
              <label className="label">Téléphone *</label>
              <input type="tel" className="input" required placeholder="05 12 34 56 78"
                value={form.phone} onChange={e => set('phone', e.target.value)}/>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="label">Email *</label>
              <input type="email" className="input" required placeholder="votre@email.com"
                value={form.email} onChange={e => set('email', e.target.value)}/>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-10"
                  required minLength={6} placeholder="Min. 6 caractères"
                  value={form.password} onChange={e => set('password', e.target.value)}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
            </div>

            {/* Confirmation */}
            <div>
              <label className="label">Confirmation *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} className="input pr-10"
                  required placeholder="Répétez le mot de passe"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}/>
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
              </div>
            </div>

          </div>

          {/* CGU */}
          <div className="flex items-start gap-3">
            <input id="terms" type="checkbox" required
              checked={form.termsAccepted} onChange={e => set('termsAccepted', e.target.checked)}
              className="h-4 w-4 text-[#2E7D32] border-gray-300 rounded mt-0.5 cursor-pointer"/>
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              J&apos;accepte les{' '}
              <Link href="/legal" target="_blank" className="text-[#2E7D32] hover:text-[#1B5E20] underline">
                conditions d&apos;utilisation
              </Link>
              {' '}et la{' '}
              <Link href="/legal" target="_blank" className="text-[#2E7D32] hover:text-[#1B5E20] underline">
                politique de confidentialité
              </Link>
            </label>
          </div>

          {/* Info box */}
          <div className="bg-[#E8F5E9] p-4 rounded-lg text-sm text-gray-700 flex gap-3">
            <Info className="h-5 w-5 text-[#2E7D32] flex-shrink-0 mt-0.5"/>
            <div>
              <strong className="text-[#2E7D32]">Information importante :</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Votre compte sera examiné après vérification de votre registre de commerce</li>
                <li>Le registre doit être un scan clair et lisible du document officiel</li>
                <li>Vous serez notifié une fois votre compte approuvé</li>
              </ul>
            </div>
          </div>

          {/* Submit */}
          <button type="submit"
            disabled={loading || !registerFile || !form.termsAccepted}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !registerFile || !form.termsAccepted
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
            }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Création en cours…
              </span>
            ) : 'Créer mon compte'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/auth/signin" className="text-[#2E7D32] hover:text-[#1B5E20] font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}