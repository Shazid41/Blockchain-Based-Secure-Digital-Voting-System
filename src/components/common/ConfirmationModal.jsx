import PrimaryButton from './PrimaryButton.jsx';
import SecondaryButton from './SecondaryButton.jsx';

export default function ConfirmationModal({ open, title, children, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="card w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="text-xl font-bold text-text">
          {title}
        </h2>
        <div className="mt-3 text-muted">{children}</div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
