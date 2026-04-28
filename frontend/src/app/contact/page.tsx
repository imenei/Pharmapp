'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import api from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9]">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#2E7D32]">PHARMA FLOW</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/" className="text-gray-700 transition-colors hover:text-[#2E7D32]">Accueil</Link>
            <Link href="/auth/signin" className="rounded-lg bg-[#2E7D32] px-4 py-2 text-white transition-colors hover:bg-[#1B5E20]">Se connecter</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-[#2E7D32]">Contactez-nous</h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Notre equipe est disponible pour repondre a toutes vos questions concernant la plateforme Pharma Flow.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6">
            {[
              { icon: <Phone className="h-6 w-6 text-[#2E7D32]" />, title: 'Telephone', lines: ['+213 553 720 952', 'Lun-Ven: 8h-18h'] },
              { icon: <Mail className="h-6 w-6 text-[#2E7D32]" />, title: 'Email', lines: ['contact@pharmaflowdz.com', 'Reponse sous 24h'] },
              { icon: <MapPin className="h-6 w-6 text-[#2E7D32]" />, title: 'Adresse', lines: ['Alger, Algerie', "Zone d'activites"] },
            ].map(({ icon, title, lines }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9]">{icon}</div>
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                </div>
                {lines.map((line) => <p key={line} className="text-sm text-gray-600">{line}</p>)}
              </div>
            ))}

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-800">Reseaux sociaux</h3>
              <div className="flex gap-3">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32] transition-colors hover:bg-[#2E7D32] hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32] transition-colors hover:bg-[#2E7D32] hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-[#2E7D32]">Envoyez-nous un message</h2>

              {success && (
                <div className="mb-6 rounded-lg border border-[#A5D6A7] bg-[#E8F5E9] p-4 font-medium text-[#2E7D32]">
                  Message envoye. Nous vous repondrons dans les plus brefs delais.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Nom complet *</label>
                    <input
                      className="input"
                      placeholder="Votre nom"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="votre@email.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Sujet *</label>
                  <input
                    className="input"
                    placeholder="Objet de votre message"
                    required
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea
                    className="input h-36 resize-none"
                    placeholder="Decrivez votre demande en detail..."
                    required
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Envoi en cours...
                    </span>
                  ) : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <p className="text-center text-sm text-gray-600">
          © 2025 Pharma Flow ·{' '}
          <Link href="/legal" className="transition-colors hover:text-[#2E7D32]">Mentions legales</Link>
        </p>
      </footer>
    </div>
  );
}
