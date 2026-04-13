import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePublicationStore } from '../../store/publicationStore';
import { campaignsApi } from '../../services/api';
import StatusBadge from '../common/StatusBadge';

const statusIndicators = {
  publicado: { icon: '✓', color: 'text-status-free', label: 'Publicado correctamente' },
  publicando: { icon: '⏳', color: 'text-sofi-teal animate-pulse-slow', label: 'Publicando...' },
  pendiente_pago: { icon: '💳', color: 'text-gray-500', label: 'En cola · requiere pago' },
  error: { icon: '✗', color: 'text-red-500', label: 'Error en publicación' },
};

export default function Step4Confirm() {
  const [publishing, setPublishing] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState({});

  const {
    selectedVacancy,
    selectedProfile,
    selectedPortals,
    campaign,
    setCampaign,
    setStep,
    reset: resetStore,
  } = usePublicationStore();

  const handlePublish = async () => {
    if (!selectedVacancy || !selectedProfile || selectedPortals.length === 0) {
      toast.error('Por favor completa todos los pasos');
      return;
    }

    setPublishing(true);
    try {
      const campaignData = {
        vacante_id: selectedVacancy.id,
        profile_id: selectedProfile.id,
        portales: selectedPortals.map((p) => p.id),
      };

      const created = await campaignsApi.create(campaignData);
      setCampaign(created);
      toast.success('Campaña creada. Iniciando publicación...');

      await campaignsApi.publish(created.id);
      setCampaign({ ...created, status: 'publicando' });
      toast.success('Publicación iniciada en los portales');

      pollCampaignStatus(created.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al publicar');
      setPublishing(false);
    }
  };

  const pollCampaignStatus = (campaignId) => {
    const pollInterval = setInterval(async () => {
      try {
        const updated = await campaignsApi.getById(campaignId);
        setCampaign(updated);

        if (updated.status === 'publicado' || updated.status === 'error') {
          clearInterval(pollInterval);
          setPublishing(false);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setPublishing(false);
      }
    }, 3000);

    return pollInterval;
  };

  const hasPaidPortals = selectedPortals.some((p) => p.modelo === 'pago');
  const totalCost = selectedPortals.reduce((sum, p) => sum + (p.costo_estimado || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Resumen de publicación</h3>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-3">Vacante seleccionada</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Código:</span>
                <span className="font-medium">{selectedVacancy?.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{selectedVacancy?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Empresa:</span>
                <span className="font-medium">{selectedVacancy?.empresa?.nombre}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Estado de publicación en portales</h4>
            <div className="space-y-2">
              {selectedPortals.map((portal) => {
                const status = campaign?.portal_status?.[portal.id] || 'pendiente';
                const indicator = statusIndicators[status];

                return (
                  <div
                    key={portal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${indicator?.color}`}>{indicator?.icon}</span>
                      <span className="font-medium text-gray-900">{portal.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-600">{indicator?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {hasPaidPortals && (
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Desglose de costos</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Portal</th>
                  <th className="text-right py-2 font-medium text-gray-700">Costo</th>
                  <th className="text-right py-2 font-medium text-gray-700">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {selectedPortals.map((portal) => (
                  <tr key={portal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 text-gray-900">{portal.nombre}</td>
                    <td className="text-right py-2 dm-mono font-medium">
                      ${portal.costo_estimado?.toLocaleString('es-MX') || '0'}
                    </td>
                    <td className="text-right py-2">
                      <StatusBadge variant={portal.modelo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total a pagar:</span>
              <span className="dm-mono text-2xl font-bold text-sofi-purple">
                MX$ {totalCost.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Método de pago</h4>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 border-2 border-sofi-purple rounded-lg hover:bg-sofi-purple-light transition-colors duration-150 font-medium text-sofi-purple">
                  💳 Tarjeta de crédito/débito
                </button>

                <button className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium text-gray-700">
                  🏦 Transferencia bancaria
                </button>

                <button className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 font-medium text-gray-700">
                  💰 Crédito Sofi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="card p-6 h-fit sticky top-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Acciones</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vacante:</span>
              <span className="font-medium text-gray-900">✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Perfil:</span>
              <span className="font-medium text-gray-900">✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Portales:</span>
              <span className="font-medium text-gray-900">{selectedPortals.length}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Portales gratis:</span>
              <span className="font-medium">
                {selectedPortals.filter((p) => p.modelo === 'gratis').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total costo:</span>
              <span className="dm-mono font-bold text-sofi-purple">
                MX$ {totalCost.toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || !selectedVacancy || !selectedProfile}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {publishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publicando...
              </>
            ) : (
              <>🚀 Iniciar publicación</>
            )}
          </button>

          <button
            onClick={() => {
              resetStore();
              setStep(1);
            }}
            className="w-full btn-ghost"
          >
            ← Nueva publicación
          </button>

          <button onClick={() => setStep(3)} className="w-full btn-secondary text-sm">
            Editar portales
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 flex gap-4 pt-6 border-t border-gray-200">
        <button onClick={() => setStep(3)} className="btn-ghost">
          ← Regresar
        </button>
      </div>
    </div>
  );
}
