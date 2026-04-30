'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import api from '@/lib/api';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra', 'Bechar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda', 'Sidi Bel Abbes', 'Annaba', 'Guelma',
  'Constantine', 'Medea', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arreridj', 'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama',
  'Ain Temouchent', 'Ghardaia', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Beni Abbes', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet',
  "El M'Ghair", 'El Menia',
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
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas depasser 5 MB');
      return;
    }
    setRegisterFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }
    if (!form.termsAccepted) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }
    if (!registerFile) {
      setError('Le registre de commerce est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('role', form.role);
      fd.append('companyName', form.companyName);
      fd.append('wilaya', form.wilaya);
      fd.append('phone', form.phone);
      fd.append('registerFile', registerFile);

      await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/auth/signup-success');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo3.png" alt="PHARMA FLOW" className="h-9 w-9 rounded-xl object-cover" />
            <img src="/1 (2).png" alt="PHARMA FLOW" className="h-8 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex space-x-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#2E7D32] transition-colors">Accueil</Link>
            <Link href="/auth/signin" className="hover:text-[#2E7D32] transition-colors">Connexion</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8 rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#2E7D32]">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Creer un compte professionnel</h2>
            <p className="mt-2 text-sm text-gray-600">Rejoignez la plateforme Pharma Flow</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Erreur</p>
                <p className="mt-0.5 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Raison sociale *</label>
              <input
                className="input"
                required
                placeholder="Nom de votre entreprise / pharmacie"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Role *</label>
              <div className="mt-1 flex gap-6">
                {(['pharmacist', 'supplier'] as const).map((role) => (
                  <label key={role} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={() => set('role', role)}
                      className="h-4 w-4 border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {role === 'pharmacist' ? 'Pharmacien' : 'Fournisseur'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label">Registre de commerce scanne *</label>
              <div className="mb-4 flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
                <p className="text-sm text-yellow-700">
                  <strong>Important :</strong> le document doit etre un scan clair et lisible de votre registre de commerce officiel.
                </p>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  registerFile ? 'border-[#2E7D32] bg-[#E8F5E9]' : 'border-[#2E7D32] hover:bg-green-50'
                }`}
              >
                {registerFile ? (
                  <div className="flex items-center justify-center gap-3 text-[#2E7D32]">
                    <CheckCircle className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-semibold">{registerFile.name}</p>
                      <p className="text-sm text-green-600">{(registerFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegisterFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                      className="ml-4 text-xs font-medium text-red-500 underline hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="text-[#2E7D32]">
                    <Upload className="mx-auto mb-3 h-10 w-10" />
                    <p className="font-semibold">Cliquez pour telecharger votre registre de commerce</p>
                    <p className="mt-1 text-sm text-gray-500">JPG, PNG ou PDF · Max 5 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">
                Le document sera verifie par un administrateur avant validation de votre compte.
              </p>
            </div>

            <div>
              <label className="label">Wilaya *</label>
              <select className="input" required value={form.wilaya} onChange={(e) => set('wilaya', e.target.value)}>
                <option value="">Selectionnez votre wilaya</option>
                {WILAYAS.map((wilaya) => <option key={wilaya} value={wilaya}>{wilaya}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Telephone *</label>
              <input
                type="tel"
                className="input"
                required
                placeholder="05 12 34 56 78"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                required
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  required
                  minLength={6}
                  placeholder="Min. 6 caracteres"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirmation *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="input pr-10"
                  required
                  placeholder="Repetez le mot de passe"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              required
              checked={form.termsAccepted}
              onChange={(e) => set('termsAccepted', e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-[#2E7D32]"
            />
            <label htmlFor="terms" className="cursor-pointer text-sm text-gray-600">
              J&apos;accepte les{' '}
              <Link href="/legal" target="_blank" className="text-[#2E7D32] underline hover:text-[#1B5E20]">
                conditions d&apos;utilisation
              </Link>{' '}
              et la{' '}
              <Link href="/legal" target="_blank" className="text-[#2E7D32] underline hover:text-[#1B5E20]">
                politique de confidentialite
              </Link>
            </label>
          </div>

          <div className="flex gap-3 rounded-lg bg-[#E8F5E9] p-4 text-sm text-gray-700">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2E7D32]" />
            <div>
              <strong className="text-[#2E7D32]">Information importante :</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
                <li>Votre compte sera examiné après vérification de votre registre du commerce.</li>
                <li>Le registre doit être un scan clair et lisible du document officiel.</li>
                <li>Vous serez notifié(e) une fois votre compte approuvé.</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !registerFile || !form.termsAccepted}
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              loading || !registerFile || !form.termsAccepted
                ? 'cursor-not-allowed bg-gray-300 text-gray-400'
                : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creation en cours...
              </span>
            ) : 'Creer mon compte'}
          </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Deja un compte ?{' '}
                <Link href="/auth/signin" className="font-medium text-[#2E7D32] hover:text-[#1B5E20]">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6">
        <p className="text-center text-sm text-gray-500">© 2026 PHARMA FLOW · Tous droits reserves</p>
      </footer>
    </div>
  );
}
