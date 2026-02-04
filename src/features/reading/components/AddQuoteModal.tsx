import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input, Textarea } from '@/shared/components/Input';
import { useReadingStore } from '@/store/readingStore';
import { useUIStore } from '@/store/uiStore';
import { v4 as uuid } from 'uuid';

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddQuoteModal({ isOpen, onClose }: AddQuoteModalProps) {
  const [quoteText, setQuoteText] = useState('');
  const [pageNumber, setPageNumber] = useState('');

  const addQuote = useReadingStore((state) => state.addQuote);
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = () => {
    if (!quoteText.trim()) {
      addToast({ type: 'error', message: 'Please enter a quote' });
      return;
    }

    addQuote({
      id: uuid(),
      text: quoteText.trim(),
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
      createdAt: new Date()
    });

    addToast({ type: 'success', message: 'Quote saved' });
    handleClose();
  };

  const handleClose = () => {
    setQuoteText('');
    setPageNumber('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Quote">
      <div className="space-y-4">
        <Textarea
          label="Quote"
          placeholder="Enter the quote..."
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          rows={4}
        />

        <Input
          label="Page Number"
          type="number"
          placeholder="Optional"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
        />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!quoteText.trim()}>
          Save Quote
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Standalone quote modal for adding quotes outside of a session
interface AddQuoteToBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onSave: (quote: { text: string; pageNumber?: number }) => void;
}

export function AddQuoteToBookModal({
  isOpen,
  onClose,
  onSave
}: AddQuoteToBookModalProps) {
  const [quoteText, setQuoteText] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = () => {
    if (!quoteText.trim()) {
      addToast({ type: 'error', message: 'Please enter a quote' });
      return;
    }

    onSave({
      text: quoteText.trim(),
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined
    });

    handleClose();
  };

  const handleClose = () => {
    setQuoteText('');
    setPageNumber('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Quote">
      <div className="space-y-4">
        <Textarea
          label="Quote"
          placeholder="Enter the quote..."
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          rows={4}
        />

        <Input
          label="Page Number"
          type="number"
          placeholder="Optional"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
        />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!quoteText.trim()}>
          Save Quote
        </Button>
      </ModalFooter>
    </Modal>
  );
}
