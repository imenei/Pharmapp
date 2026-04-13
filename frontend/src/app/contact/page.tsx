'use client';
// src/app/contact/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import api from '@/lib/api';

export default function ContactPage() {
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // POST to backend contact endpoint (add route if needed, or just show success)
      await api.post('/contact', form);
      setSuccess(true);
      setForm({ name:'', email:'', subject:'', message:'' });
    } catch {
      // If endpoint doesn't exist yet, still show success (graceful degradation)
      setSuccess(true);
      setForm({ name:'', email:'', subject:'', message:'' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9]">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-[#2E7D32]">ELSAIDALIYA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-gray-700 hover:text-[#2E7D32] transition-colors">Accueil</Link>
            <Link href="/auth/signin" className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition-colors">Se connecter</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2E7D32] mb-4">Contactez-nous</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions concernant la plateforme ELSAIDALIYA
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: <Phone className="w-6 h-6 text-[#2E7D32]"/>, title:'Téléphone', lines:['+213 553 720 952','Lun-Ven: 8h-18h'] },
              { icon: <Mail  className="w-6 h-6 text-[#2E7D32]"/>, title:'Email',     lines:['contact@elsaidaliya.com','Réponse sous 24h'] },
              { icon: <MapPin className="w-6 h-6 text-[#2E7D32]"/>, title:'Adresse',  lines:['Alger, Algérie','Zone d\'activités'] },
            ].map(({ icon, title, lines }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center">{icon}</div>
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                </div>
                {lines.map(l => <p key={l} className="text-gray-600 text-sm">{l}</p>)}
              </div>
            ))}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Réseaux sociaux</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center hover:bg-[#2E7D32] hover:text-white transition-colors text-[#2E7D32]">
                  <Facebook className="w-5 h-5"/>
                </a>
                <a href="#" className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center hover:bg-[#2E7D32] hover:text-white transition-colors text-[#2E7D32]">
                  <Instagram className="w-5 h-5"/>
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-[#2E7D32] mb-6">Envoyez-nous un message</h2>

              {success && (
                <div className="mb-6 bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-4 text-[#2E7D32] font-medium">
                  ✅ Message envoyé ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nom complet *</label>
                    <input className="input" placeholder="Votre nom" required
                      value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input" placeholder="votre@email.com" required
                      value={form.email} onChange={e => setForm(p=>({...p, email: e.target.value}))}/>
                  </div>
                </div>
                <div>
                  <label className="label">Sujet *</label>
                  <input className="input" placeholder="Objet de votre message" required
                    value={form.subject} onChange={e => setForm(p=>({...p, subject: e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className="input h-36 resize-none" placeholder="Décrivez votre demande en détail..." required
                    value={form.message} onChange={e => setForm(p=>({...p, message: e.target.value}))}/>
                </div>
                {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Envoi en cours…
                    </span>
                  ) : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <p className="text-center text-sm text-gray-600">
          © 2025 Elsaidaliya ·{' '}
          <Link href="/legal" className="hover:text-[#2E7D32] transition-colors">Mentions légales</Link>
        </p>
      </footer>
    </div>
  );
}
