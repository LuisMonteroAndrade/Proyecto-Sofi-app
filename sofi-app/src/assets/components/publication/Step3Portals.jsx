import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePublicationStore } from '../../store/publicationStore';
import { portalsApi } from '../../services/api';
import StatusBadge from '../common/StatusBadge';

const countries = [
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'GLOBAL', name: 'Global', flag: '🌎' },
];

export default function Step3Portals() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('todos');

  const {
    selectedCountries,
    setSelectedCountries,
    selectedPortals,
    togglePortal,
    setStep,
  } = usePublicationStore();

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    setLoading(true);
    try {
      const data = await portalsApi.getAll();
      setPortals(data);
    } catch (error) {
      toast.error('Error al cargar los portales');
    } finally {
      setLoading(false);
    }
  };

  const toggleCountry = (code) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const filteredPortals = portals.filter((p) => {
    const countryMatch =
      selectedCountries.length === 0 ||
      selectedCountries.some((c) => p.paises?.includes(c));

    const typeMatch =
      filterTab === 'todos' ||
      (filterTab === 'gratis' && p.modelo === 'gratis') ||
      (filterTab === 'pago' && p.modelo === 'pago') ||
      (filterTab === 'freemium' && p.modelo === 'freemium');

    return countryMatch && typeMatch;
  });

  const totalCost = selectedPortals.reduce((sum, p) => sum + (p.costo_estimado || 0), 0);
  const paidPortals = selectedPortals.filter((p) => p.modelo === 'pago');
  const freePortals = selectedPortals.filter((p) => p.modelo === 'gratis');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Selecciona los países</h3>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => toggleCountry(country.code)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${
                  selectedCountries.includes(country.code)
                    ? 'bg-sofi-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {country.flag} {country.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Portales disponibles</h3>

          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {['todos', 'gratis', 'pago', 'freemium'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 text-sm capitalize ${
                    filterTab === tab
                      ? 'border-sofi-purple text-sofi-purple'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'todos' ? 'Todos' : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredPortals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay portales disponibles para los criterios seleccionados
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPortals.map((portal) => (
                <div
                  key={portal.id}
                  className="card p-4 hover:shadow-md transition-all duration-150"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedPortals.some((p) => p.id === portal.id)}
                      onChange={() => togglePortal(portal)}
                      className="w-4 h-4 text-sofi-purple rounded cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {portal.logo_url && (
                          <img
                            src={portal.logo_url}
                            alt={portal.nombre}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <h4 className="font-semibold text-gray-900">{portal.nombre}</h4>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <StatusBadge variant={portal.modelo} />
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {portal.paises?.join(', ') || 'Global'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {portal.modelo === 'pago' ? (
                        <p className="dm-mono font-semibold text-gray-900">
                          ${portal.costo_estimado?.toLocaleString('es-MX') || '0'}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-status-free">Gratis</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="card p-6 h-fit sticky top-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Resumen de costo</h3>

          {selectedPortals.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Selecciona portales para ver el resumen</p>
            </div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto space-y-2 pb-4 border-b border-gray-200">
                {selectedPortals.map((portal) => (
                  <div key={portal.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{portal.nombre}</span>
                    <button
                      onClick={() => togglePortal(portal)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Portales gratuitos:</span>
                  <span className="font-medium">{freePortals.length} portales · $0</span>
                </div>

                {paidPortals.length > 0 && (
                  <div className="space-y-1">
                    {paidPortals.map((portal) => (
                      <div key={portal.id} className="flex justify-between text-gray-600">
                        <span>{portal.nombre}:</span>
                        <span className="dm-mono font-medium">
                          ${portal.costo_estimado?.toLocaleString('es-MX')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold text-gray-900">Total estimado:</span>
                  <span className="dm-mono font-bold text-lg text-sofi-purple">
                    MX$ {totalCost.toLocaleString('es-MX')}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ Los costos son estimados y pueden variar según el plan de pago.
                </p>
              </div>

              <div className="bg-sofi-teal-light border border-sofi-teal border-opacity-30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✦</span>
                  <div>
                    <p className="text-sm font-semibold text-sofi-teal-dark">Recomendación de IA</p>
                    <p className="text-xs text-gray-700 mt-1">
                      Basada en tu vacante, te recomendamos estos portales para máxima visibilidad
                    </p>
                    <button className="text-xs font-semibold text-sofi-teal hover:underline mt-2">
                      → Aplicar selección sugerida
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex gap-4 pt-6 border-t border-gray-200">
        <button onClick={() => setStep(2)} className="btn-ghost">
          ← Regresar
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={selectedPortals.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          Continuar → Revisar y publicar
        </button>
      </div>
    </div>
  );
}
