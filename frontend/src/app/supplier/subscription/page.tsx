'use client';
// src/app/supplier/subscription/page.tsx
import { useState, useRef } from 'react';
import { Crown, Check, Upload } from 'lucide-react';
import { useSubscriptionPlans, useSupplierSubscription, useSubmitSubscription } from '@/hooks/useApi';
import { TierBadge, Spinner } from '@/components/ui';

const TIER_GRADIENT: Record<string, string> = {
  gold: 'from-yellow-400 to-amber-500',
  silver: 'from-gray-300 to-slate-400',
  bronze: 'from-orange-300 to-amber-400',
};

export default function SupplierSubscriptionPage() {
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSub } = useSupplierSubscription();
  const submit = useSubmitSubscription();
  const proofRef = useRef<HTMLInputElement>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [msg, setMsg] = useState('');

  const isSubActive = currentSub?.isActive && currentSub?.subscriptionEnd && new Date(currentSub.subscriptionEnd) > new Date();

  const handleSubmit = async () => {
    if (!selectedPlan || !proofFile) { setMsg('Veuillez sélectionner un plan et joindre votre preuve de paiement'); return; }
    const fd = new FormData();
    fd.append('planId', selectedPlan);
    fd.append('proof', proofFile);
    setMsg('');
    try {
      await submit.mutateAsync(fd);
      setMsg('✅ Demande envoyée ! L\'administrateur va vérifier votre paiement.');
      setStep('plans'); setProofFile(null); setSelectedPlan(null);
    } catch (e: any) { setMsg('❌ ' + (e.response?.data?.message || 'Erreur')); }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm">Choisissez votre plan pour augmenter votre visibilité</p>
      </div>

      {/* Current subscription */}
      {isSubActive && (
        <div className="card border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-4">
            <Crown size={40} className="text-yellow-500"/>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-bold text-gray-900 text-lg">Plan {currentSub.subscriptionPlan?.name}</p>
                <TierBadge tier={currentSub.subscriptionPlan?.tier}/>
              </div>
              <p className="text-gray-600">Actif jusqu&apos;au <strong>{new Date(currentSub.subscriptionEnd).toLocaleDateString('fr-DZ')}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Pending payment */}
      {currentSub && !currentSub.isActive && currentSub.status === 'pending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-semibold text-blue-800">⏳ Paiement en cours de vérification</p>
          <p className="text-sm text-blue-700 mt-0.5">Votre preuve de paiement a bien été reçue. L&apos;administrateur va la valider prochainement.</p>
        </div>
      )}

      {step === 'plans' ? (
        <>
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billing === 'monthly' ? 'font-semibold text-gray-900' : 'text-gray-500'}>Mensuel</span>
            <button onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === 'yearly' ? 'translate-x-6' : ''}`}/>
            </button>
            <span className={billing === 'yearly' ? 'font-semibold text-gray-900' : 'text-gray-500'}>
              Annuel <span className="text-xs text-green-600 font-medium ml-1">Économisez</span>
            </span>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg"/></div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-5">
              {plans.map((plan: any) => {
                const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;
                const isSelected = selectedPlan === plan.id;
                const isCurrent = currentSub?.subscriptionPlan?.id === plan.id && isSubActive;
                return (
                  <div key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`card cursor-pointer transition-all hover:shadow-lg border-2 relative ${isSelected ? 'border-blue-600 shadow-blue-100 shadow-lg' : 'border-gray-200'} ${isCurrent ? 'ring-2 ring-green-400' : ''}`}>
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">Plan actuel</span>
                    )}
                    {plan.tier === 'gold' && (
                      <span className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">⭐ Recommandé</span>
                    )}

                    {/* Tier badge header */}
                    <div className={`h-2 rounded-t-lg -mt-6 -mx-6 mb-4 bg-gradient-to-r ${TIER_GRADIENT[plan.tier] ?? 'from-gray-300 to-gray-400'}`}/>

                    <TierBadge tier={plan.tier}/>
                    <h3 className="text-xl font-bold text-gray-900 mt-3 mb-1">Plan {plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">{price.toLocaleString()} DA</span>
                      <span className="text-gray-500 text-sm"> / {billing === 'yearly' ? 'an' : 'mois'}</span>
                    </div>

                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check size={14} className="text-green-500 mt-0.5 shrink-0"/>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={e => { e.stopPropagation(); setSelectedPlan(plan.id); setStep('payment'); }}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${isSelected ? 'btn-primary' : 'btn-secondary'}`}>
                      {isCurrent ? 'Renouveler' : 'Choisir ce plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Payment step */
        <div className="card max-w-lg mx-auto space-y-5">
          <button onClick={() => setStep('plans')} className="text-sm text-blue-600 hover:underline">← Retour aux plans</button>
          <h2 className="text-lg font-bold text-gray-900">Soumettre votre paiement</h2>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1">
            <p className="font-semibold">📋 Instructions de paiement :</p>
            <p>1. Effectuez un virement bancaire ou CCP au nom de <strong>El Saidalya SARL</strong></p>
            <p>2. Montant : <strong>{billing === 'yearly' ? plans.find((p:any)=>p.id===selectedPlan)?.yearlyPrice.toLocaleString() : plans.find((p:any)=>p.id===selectedPlan)?.price.toLocaleString()} DA</strong></p>
            <p>3. Joignez votre reçu ci-dessous</p>
          </div>

          <div>
            <label className="label">Preuve de paiement (reçu / virement) *</label>
            <div onClick={() => proofRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              {proofFile ? (
                <div>
                  <Upload size={28} className="mx-auto text-blue-600 mb-2"/>
                  <p className="font-medium text-gray-900">{proofFile.name}</p>
                  <p className="text-xs text-gray-500">{(proofFile.size/1024/1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <Upload size={28} className="mx-auto text-gray-400 mb-2"/>
                  <p className="text-gray-600">PDF, JPG ou PNG (max 10 MB)</p>
                </div>
              )}
            </div>
            <input ref={proofRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] ?? null)}/>
          </div>

          {msg && <div className={`text-sm px-4 py-3 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

          <button onClick={handleSubmit} className="btn-primary w-full py-3" disabled={submit.isPending || !proofFile}>
            {submit.isPending ? <Spinner size="sm"/> : '📤 Soumettre ma demande d\'abonnement'}
          </button>
        </div>
      )}
    </div>
  );
}
