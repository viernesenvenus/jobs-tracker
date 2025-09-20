'use client';

import React from 'react';
import { useModal } from '@/contexts/ModalContext';
import { ApplicationModal } from './modals/ApplicationModal';
import { CVAdaptationModal } from './modals/CVAdaptationModal';
import { FollowUpModal } from './modals/FollowUpModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

export function ModalContainer() {
  const { modals, closeModal } = useModal();

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => {
        const handleClose = () => {
          modal.onClose();
          closeModal(modal.id);
        };

        const handleConfirm = (data?: any) => {
          if (modal.onConfirm) {
            modal.onConfirm(data);
          }
          handleClose();
        };

        switch (modal.type) {
          case 'application':
            return (
              <ApplicationModal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
                data={modal.data}
              />
            );
          case 'cv_adaptation':
            return (
              <CVAdaptationModal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
                data={modal.data}
              />
            );
          case 'follow_up':
            return (
              <FollowUpModal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
                data={modal.data}
              />
            );
          case 'confirmation':
            return (
              <ConfirmationModal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
                data={modal.data}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
