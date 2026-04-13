import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePublicationStore } from '../../store/publicationStore';
import { profilesApi } from '../../services/api';

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 ${
      active
        ? 'border-sofi-purple text-sofi-purple'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

export default function Step2Profile() {
  const [activeTab, setActiveTab] = useState('ai');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { selectedProfile, setSelectedProfile, setStep } = usePublicationStore();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await profilesApi.getAll();
      setProfiles(data);
    } catch (error) {
      toast.error('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const onGenerateAI = async (data) => {
    setGeneratingAI(true);
    try {
      const result = await profilesApi.generateWithAI(data);
      setSelectedProfile(result);
      setAiSuggestions(result.suggestions || []);
      toast.success('Descripción generada con IA');
    } catch (error) {
      toast.error('Error al generar con IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  const onCreateManual = async (data) => {
    try {
      const created = await profilesApi.create(data);
      setProfiles([...profiles, created]);
      setSelectedProfile(created);
      reset();
      toast.success('Perfil creado correctamente');
    } catch (error) {
      toast.error('Error al crear el perfil');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
            ✦ Generar con IA
          </TabButton>
          <TabButton active={activeTab === 'existing'} onClick={() => setActiveTab('existing')}>
            Cargar perfil existente
          </TabButton>
          <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>
            Crear manualmente
          </TabButton>
        </div>
      </div>

      {activeTab === 'ai' && (
        <form onSubmit={handleSubmit(onGenerateAI)} className="space-y-4">
          <div className="bg-sofi-purple-light border border-sofi-purple border-opacity-20 rounded-lg p-4 flex items-start gap-3">
            <span className="text-2xl">✦</span>
            <div>
              <p className="font-semibold text-sofi-purple">Sofi AI genera tu descripción optimizada</p>
              <p className="text-sm text-gray-600 mt-1">Crea una descripción de puesto adaptada y atractiva para candidates basada en IA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del puesto *</label>
              <textarea
                {...register('descripcion_puesto', { required: 'Este campo es requerido' })}
                maxLength={1000}
                placeholder="Describe el puesto en detalle..."
                className="input-primary"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">{watch('descripcion_puesto')?.length || 0}/1000</p>
              {errors.descripcion_puesto && <p className="text-red-500 text-sm mt-1">{errors.descripcion_puesto.message}</p>}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de experiencia *</label>
                <select {...register('nivel_experiencia', { required: 'Selecciona un nivel' })} className="input-primary">
                  <option value="">Selecciona...</option>
                  <option value="sin_experiencia">Sin experiencia</option>
                  <option value="1-2">1-2 años</option>
                  <option value="3-5">3-5 años</option>
                  <option value="senior">Senior</option>
                </select>
                {errors.nivel_experiencia && <p className="text-red-500 text-sm mt-1">{errors.nivel_experiencia.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tono *</label>
                <select {...register('tono', { required: 'Selecciona un tono' })} className="input-primary">
                  <option value="">Selecciona...</option>
                  <option value="amigable">Amigable</option>
                  <option value="formal">Formal</option>
                  <option value="dinamico">Dinámico</option>
                </select>
                {errors.tono && <p className="text-red-500 text-sm mt-1">{errors.tono.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={generatingAI}
            className="btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generatingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>✦ Generar con IA</>
            )}
          </button>

          {aiSuggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>💡</span> Sugerencias de IA
              </h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, i) => (
                  <p key={i} className="text-sm text-gray-700 p-2 bg-yellow-100 rounded">
                    • {suggestion}
                  </p>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {activeTab === 'existing' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay perfiles guardados
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`card p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
                    selectedProfile?.id === profile.id ? 'ring-2 ring-sofi-purple' : ''
                  }`}
                >
                  <h4 className="font-semibold text-gray-900">{profile.titulo_anuncio}</h4>
                  <p className="text-sm text-gray-600 mt-1">{profile.empresa?.nombre}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{profile.categoria?.nombre}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Usado {profile.usage_count || 0}x</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProfile(profile);
                    }}
                    className="mt-3 w-full text-sm btn-secondary"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit(onCreateManual)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título del anuncio *</label>
              <input
                {...register('titulo_anuncio', { required: 'El título es requerido' })}
                className="input-primary"
                placeholder="Ej: Desarrollador React Senior"
              />
              {errors.titulo_anuncio && <p className="text-red-500 text-sm mt-1">{errors.titulo_anuncio.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de jornada *</label>
              <select {...register('tipo_jornada', { required: 'Selecciona una jornada' })} className="input-primary">
                <option value="">Selecciona...</option>
                <option value="tiempo_completo">Tiempo completo</option>
                <option value="medio_tiempo">Medio tiempo</option>
                <option value="freelance">Freelance</option>
                <option value="practicante">Practicante</option>
              </select>
              {errors.tipo_jornada && <p className="text-red-500 text-sm mt-1">{errors.tipo_jornada.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salario mínimo</label>
              <input
                type="number"
                {...register('salario_minimo')}
                className="input-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salario máximo</label>
              <input
                type="number"
                {...register('salario_maximo')}
                className="input-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
              <select {...register('moneda')} className="input-primary">
                <option value="">Selecciona...</option>
                <option value="MXN">MX$ - Peso Mexicano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <input
                {...register('ubicacion')}
                className="input-primary"
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              {...register('descripcion', { required: 'La descripción es requerida' })}
              className="input-primary"
              rows="5"
              placeholder="Descripción completa del puesto..."
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
          </div>

          <button type="submit" className="btn-primary">
            Crear perfil
          </button>
        </form>
      )}

      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button onClick={() => setStep(1)} className="btn-ghost">
          ← Regresar
        </button>
        <button onClick={() => setPreviewOpen(true)} className="btn-secondary">
          👁 Previsualizar
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!selectedProfile}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          Continuar →
        </button>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{selectedProfile?.titulo_anuncio}</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo de jornada</p>
                <p className="text-gray-900">{selectedProfile?.tipo_jornada}</p>
              </div>
              {selectedProfile?.salario_minimo && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Salario</p>
                  <p className="text-gray-900 dm-mono">${selectedProfile.salario_minimo} - ${selectedProfile.salario_maximo} {selectedProfile.moneda}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">Ubicación</p>
                <p className="text-gray-900">{selectedProfile?.ubicacion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Descripción</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProfile?.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
