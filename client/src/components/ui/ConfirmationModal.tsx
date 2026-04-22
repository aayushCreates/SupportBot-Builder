import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmMatchText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmMatchText,
  variant = 'danger',
  isLoading = false,
}) => {
  const [inputText, setInputText] = useState('');

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    setInputText('');
  };

  const isConfirmDisabled = confirmMatchText ? inputText !== confirmMatchText : false;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-900',
          subtext: 'text-red-700',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-900',
          subtext: 'text-amber-700',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-900',
          subtext: 'text-blue-700',
          icon: <Info className="w-5 h-5 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className={styles.button}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-2xl border ${styles.bg} ${styles.border} flex gap-4`}>
          <div className="shrink-0 mt-0.5">{styles.icon}</div>
          <div className="space-y-1">
            <p className={`text-sm font-bold ${styles.text}`}>{title}</p>
            <p className={`text-xs leading-relaxed font-medium ${styles.subtext}`}>
              {message}
            </p>
          </div>
        </div>

        {confirmMatchText && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              To proceed, please type <span className="font-bold text-gray-900 select-all">"{confirmMatchText}"</span> in the field below:
            </p>
            <Input
              placeholder="Type here to confirm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="font-medium"
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
