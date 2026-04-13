import React from 'react';
import { usePublicationStore } from '../store/publicationStore';
import Topbar from '../components/layout/Topbar';
import Stepper from '../components/common/Stepper';
import Step1Vacancy from '../components/publication/Step1Vacancy';
import Step2Profile from '../components/publication/Step2Profile';
import Step3Portals from '../components/publication/Step3Portals';
import Step4Confirm from '../components/publication/Step4Confirm';

const steps = ['Vacante', 'Perfil', 'Portales', 'Publicar'];

export default function PublicationPage() {
  const { currentStep, setStep } = usePublicationStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar vacante</h1>
          <p className="text-gray-600">Dashboard → Publicar vacante</p>
        </div>

        <div className="mb-8">
          <Stepper currentStep={currentStep} steps={steps} onStepClick={setStep} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && <Step1Vacancy />}
          {currentStep === 2 && <Step2Profile />}
          {currentStep === 3 && <Step3Portals />}
          {currentStep === 4 && <Step4Confirm />}
        </div>
      </div>
    </div>
  );
}
