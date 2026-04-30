'use client';

import { useRef, useState } from 'react';
import { Crown, Check, Upload, Lock, Trash2, Eye } from 'lucide-react';
import {
  useSubscriptionPlans,
  useSupplierSubscription,
  useSubmitSubscription,
  useDeletePendingSubscription,
} from '@/hooks/useApi';
import { TierBadge, Spinner } from '@/components/ui';
import { toAssetUrl } from '@/lib/runtime-config';
import { getWelcomeTrialLabel } from '@/lib/subscription-offers';

const TIER_GRADIENT: Record<string, string> = {
  gold: 'from-yellow-400 to-amber-500',
  silver: 'from-gray-300 to-slate-400',
  bronze: 'from-orange-300 to-amber-400',
};

export default function SupplierSubscriptionPage() {
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSub } = useSupplierSubscription();
  const submit = useSubmitSubscription();
  const deletePending = useDeletePendingSubscription();
  const proofRef = useRef<HTMLInputElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [msg, setMsg] = useState('');

  const isSubActive =
    (currentSub?.accessGranted || currentSub?.isActive) &&
    currentSub?.subscriptionEnd &&
    new Date(currentSub.subscriptionEnd) > new Date();

  const isPendingReview =
    currentSub &&
    !currentSub.trialActive &&
    !currentSub.isActive &&
    currentSub.status === 'pending';

  const trialLabel = getWelcomeTrialLabel();

  const renderFeature = (feature: string) => {
    if (/essai|gratuite|gratuit/i.test(feature)) {
      return trialLabel;
    }
    return feature;
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !proofFile) {
      setMsg('Veuillez selectionner un plan et joindre votre preuve de paiement.');
      return;
    }

    const fd = new FormData();
    fd.append('planId', selectedPlan);
    fd.append('proof', proofFile);
    setMsg('');

    try {
      await submit.mutateAsync(fd);
      setMsg("Preuve envoyee avec succes. Elle reste visible jusqu'a sa validation ou sa suppression.");
      setProofFile(null);
      setSelectedPlan(null);
      setStep('plans');
      if (proofRef.current) proofRef.current.value = '';
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Erreur');
    }
  };

  const handleDeletePending = async () => {
    try {
      const response = await deletePending.mutateAsync();
      setMsg(response?.message || 'Preuve supprimee.');
      setProofFile(null);
      if (proofRef.current) proofRef.current.value = '';
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Impossible de supprimer la preuve.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm">Choisissez votre plan et gerez votre preuve de paiement.</p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">Offre actuelle : {trialLabel}</p>
        <p className="mt-1">
          Le premier abonnement valide profite de cette offre. Ensuite, les renouvellements suivent la duree normale du plan choisi.
        </p>
      </div>

      {isSubActive && (
        <div className="card border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-4">
            <Crown size={40} className="text-yellow-500" />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <p className="text-lg font-bold text-gray-900">Plan {currentSub.subscriptionPlan?.name}</p>
                <TierBadge tier={currentSub.subscriptionPlan?.tier} />
              </div>
              <p className="text-gray-600">
                Actif jusqu&apos;au <strong>{new Date(currentSub.subscriptionEnd).toLocaleDateString('fr-DZ')}</strong>
              </p>
              {currentSub?.trialActive && (
                <p className="mt-1 text-sm text-emerald-700">
                  Votre acces gratuit est actuellement actif. Consultez ci-dessous les abonnements disponibles apres cette periode.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isPendingReview && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-blue-800">
            <Lock size={16} />
            Paiement en cours de verification
          </div>
          <p className="text-sm text-blue-700">
            Votre preuve de paiement a bien ete recue. Tant qu&apos;elle est en attente, vous ne pouvez pas soumettre un autre abonnement.
          </p>
          <div className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="font-medium text-gray-900">{currentSub.subscriptionPlan?.name}</p>
            <p className="mt-1 text-sm text-gray-500">
              Depose le {new Date(currentSub.createdAt).toLocaleString('fr-DZ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={toAssetUrl(currentSub.proofUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Eye size={16} />
                Voir le recu
              </a>
              <button
                onClick={handleDeletePending}
                disabled={deletePending.isPending}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                {deletePending.isPending ? <Spinner size="sm" /> : <Trash2 size={16} />}
                Supprimer le recu
              </button>
            </div>
          </div>
        </div>
      )}

      {!isPendingReview && step === 'plans' ? (
        <>
          <div className="text-center text-sm text-gray-500">
            Consultez librement nos differentes offres d&apos;abonnement et leurs avantages.
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className={billing === 'monthly' ? 'font-semibold text-gray-900' : 'text-gray-500'}>Mensuel</span>
            <button
              onClick={() => setBilling((b) => (b === 'monthly' ? 'yearly' : 'monthly'))}
              className={`relative h-6 w-12 rounded-full ${billing === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${billing === 'yearly' ? 'translate-x-6' : ''}`}
              />
            </button>
            <span className={billing === 'yearly' ? 'font-semibold text-gray-900' : 'text-gray-500'}>Annuel</span>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {plans.map((plan: any) => {
                const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`card relative cursor-pointer border-2 transition-all hover:shadow-lg ${
                      selectedPlan === plan.id ? 'border-blue-600 shadow-lg shadow-blue-100' : 'border-gray-200'
                    }`}
                  >
                    <div className={`-mx-6 -mt-6 mb-4 h-2 rounded-t-lg bg-gradient-to-r ${TIER_GRADIENT[plan.tier] ?? 'from-gray-300 to-gray-400'}`} />
                    <TierBadge tier={plan.tier} />
                    <h3 className="mb-1 mt-3 text-xl font-bold text-gray-900">Plan {plan.name}</h3>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">{price.toLocaleString()} DA</span>
                      <span className="text-sm text-gray-500"> / {billing === 'yearly' ? 'an' : 'mois'}</span>
                    </div>

                    <ul className="mb-5 space-y-2">
                      {plan.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check size={14} className="mt-0.5 shrink-0 text-green-500" />
                          <span>{renderFeature(f)}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                        setStep('payment');
                      }}
                      className={`${selectedPlan === plan.id ? 'btn-primary' : 'btn-secondary'} w-full rounded-lg py-2.5 text-sm font-medium`}
                    >
                      Choisir ce plan
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : !isPendingReview ? (
        <div className="card mx-auto max-w-lg space-y-5">
          <button onClick={() => setStep('plans')} className="text-sm text-blue-600 hover:underline">
            Retour aux plans
          </button>

          <h2 className="text-lg font-bold text-gray-900">Soumettre votre paiement</h2>

          <div className="space-y-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold">Titre : Pharma Flow</p>
              <p>Paiement par virement bancaire</p>
            </div>

            <div className="space-y-1">
              <p><span className="font-semibold">Nom du beneficiaire :</span> Pharma Flow</p>
              <p className="font-semibold">Coordonnees bancaires :</p>
              <p><span className="font-medium">Banque :</span> BDL Algerie</p>
              <p><span className="font-medium">RIB :</span> 123 456 789 000</p>
              <p><span className="font-medium">SWIFT :</span> BNALDZAL</p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold">Instructions :</p>
              <p>1. Effectuez le virement depuis votre banque</p>
              <p>
                2. Montant :
                <strong>
                  {' '}
                  {billing === 'yearly'
                    ? plans.find((p: any) => p.id === selectedPlan)?.yearlyPrice?.toLocaleString()
                    : plans.find((p: any) => p.id === selectedPlan)?.price?.toLocaleString()} DA
                </strong>
              </p>
              <p>3. Prenez une capture du recu</p>
              <p>4. Telechargez-la sur la plateforme</p>
            </div>
          </div>

          <div>
            <label className="label">Deposer le recu de virement *</label>
            <div
              onClick={() => proofRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 hover:bg-blue-50"
            >
              {proofFile ? (
                <div>
                  <Upload size={28} className="mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-900">{proofFile.name}</p>
                  <p className="text-xs text-gray-500">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Choisir un fichier</p>
                  <p className="mt-1 text-xs text-gray-500">PDF, JPG ou PNG (max 10 MB)</p>
                </div>
              )}
            </div>

            <input
              ref={proofRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {msg && <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">{msg}</div>}

          <button onClick={handleSubmit} className="btn-primary w-full py-3" disabled={submit.isPending || !proofFile}>
            {submit.isPending ? <Spinner size="sm" /> : 'Envoyer la preuve'}
          </button>
        </div>
      ) : null}
    </div>
  );
}