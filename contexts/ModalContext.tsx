'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ModalContextType {
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  openApplicationModal: (applicationId?: string) => string;
  openCVAdaptationModal: (cvId: string, jobApplicationId: string) => string;
  openFollowUpModal: (applicationId: string) => string;
  openConfirmationModal: (title: string, message: string, onConfirm: () => void) => string;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = useCallback((modal: Omit<Modal, 'id'>): string => {
    const id = uuidv4();
    const newModal: Modal = {
      ...modal,
      id
    };

    setModals(prev => [...prev, newModal]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const openApplicationModal = useCallback((applicationId?: string, onConfirm?: (data: any) => void, applicationData?: any): string => {
    return openModal({
      type: 'application',
      data: { applicationId, applicationData },
      onClose: () => closeModal(applicationId || ''),
      onConfirm: onConfirm
    });
  }, [openModal, closeModal]);

  const openCVAdaptationModal = useCallback((cvId: string, jobApplicationId: string): string => {
    return openModal({
      type: 'cv_adaptation',
      data: { cvId, jobApplicationId },
      onClose: () => closeModal(cvId)
    });
  }, [openModal, closeModal]);

  const openFollowUpModal = useCallback((applicationId: string): string => {
    return openModal({
      type: 'follow_up',
      data: { applicationId },
      onClose: () => closeModal(applicationId)
    });
  }, [openModal, closeModal]);

  const openConfirmationModal = useCallback((title: string, message: string, onConfirm: () => void): string => {
    return openModal({
      type: 'confirmation',
      data: { title, message },
      onConfirm,
      onClose: () => closeModal('')
    });
  }, [openModal, closeModal]);

  return (
    <ModalContext.Provider value={{
      modals,
      openModal,
      closeModal,
      closeAllModals,
      openApplicationModal,
      openCVAdaptationModal,
      openFollowUpModal,
      openConfirmationModal
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
