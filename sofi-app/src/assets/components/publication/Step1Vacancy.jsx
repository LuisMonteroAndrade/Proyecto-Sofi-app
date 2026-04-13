import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePublicationStore } from '../../store/publicationStore';
import { vacanciesApi, companiesApi, categoriesApi } from '../../services/api';

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

export default function Step1Vacancy() {
  const [activeTab, setActiveTab] = useState('existing');
  const [vacancies, setVacancies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const { selectedVacancy, setSelectedVacancy, currentStep, setStep } = usePublicationStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vacanciesToLoad, companiesToLoad, categoriesToLoad] = await Promise.all([
        vacanciesApi.getAll(),
        companiesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setVacancies(vacanciesToLoad);
      setCompanies(companiesToLoad);
      setCategories(categoriesToLoad);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onCreateVacancy = async (data) => {
    try {
      const created = await vacanciesApi.create(data);
      setVacancies([...vacancies, created]);
      setSelectedVacancy(created);
      setActiveTab('existing');
      reset();
      toast.success('Vacante creada correctamente');
    } catch (error) {
      toast.error('Error al crear la vacante');
    }
  };

  const filteredVacancies = vacancies.filter((v) => {
    const matchesSearch = v.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || v.estado === statusFilter;
    const matchesCompany = !companyFilter || v.empresa_id === parseInt(companyFilter);
    return matchesSearch && matchesStatus && matchesCompany;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <TabButton active={activeTab === 'existing'} onClick={() => setActiveTab('existing')}>
              Vacantes existentes
            </TabButton>
            <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')}>
              Crear nueva vacante
            </TabButton>
          </div>
        </div>

        {activeTab === 'existing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary"
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-primary">
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="cerrada">Cerrada</option>
              </select>
              <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="input-primary">
                <option value="">Todas las empresas</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredVacancies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron vacantes
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Código</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Empresa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Categoría</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVacancies.map((vacancy) => (
                      <tr
                        key={vacancy.id}
                        onClick={() => setSelectedVacancy(vacancy)}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                          selectedVacancy?.id === vacancy.id ? 'bg-sofi-purple-light' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm">{vacancy.codigo}</td>
                        <td className="py-3 px-4 text-sm font-medium">{vacancy.nombre}</td>
                        <td className="py-3 px-4 text-sm">{vacancy.empresa?.nombre || '-'}</td>
                        <td className="py-3 px-4 text-sm">{vacancy.categoria?.nombre || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            vacancy.estado === 'activa' ? 'bg-green-100 text-green-800' :
                            vacancy.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vacancy.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleSubmit(onCreateVacancy)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="input-primary"
                  placeholder="Nombre de la vacante"
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
                <select {...register('empresa_id', { required: 'Selecciona una empresa' })} className="input-primary">
                  <option value="">Selecciona una empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {errors.empresa_id && <p className="text-red-500 text-sm mt-1">{errors.empresa_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                <select {...register('categoria_id', { required: 'Selecciona una categoría' })} className="input-primary">
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                <select {...register('estado', { required: 'Selecciona un estado' })} className="input-primary">
                  <option value="">Selecciona un estado</option>
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="cerrada">Cerrada</option>
                </select>
                {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                {...register('descripcion')}
                className="input-primary"
                rows="4"
                placeholder="Descripción de la vacante"
              />
            </div>

            <button type="submit" className="btn-primary">
              Crear vacante
            </button>
          </form>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-fit">
        <h3 className="font-semibold text-gray-900 mb-4">Resumen de vacante</h3>
        {selectedVacancy ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Código</p>
              <p className="text-sm font-medium">{selectedVacancy.codigo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Nombre</p>
              <p className="text-sm font-medium">{selectedVacancy.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Empresa</p>
              <p className="text-sm">{selectedVacancy.empresa?.nombre || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Categoría</p>
              <p className="text-sm">{selectedVacancy.categoria?.nombre || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Estado</p>
              <p className="text-sm capitalize">{selectedVacancy.estado}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No hay vacante seleccionada</p>
          </div>
        )}

        <button
          onClick={() => setStep(2)}
          disabled={!selectedVacancy}
          className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
