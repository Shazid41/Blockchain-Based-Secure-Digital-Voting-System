import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import FormInput from './FormInput.jsx';

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FormInput type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        className="focus-ring absolute right-3 top-9 rounded p-2 text-muted hover:text-primary"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
