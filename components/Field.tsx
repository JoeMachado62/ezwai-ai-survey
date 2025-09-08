import { clsx } from "clsx";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function TextField({ 
  label, 
  className, 
  ...props 
}: { 
  label: string 
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <input className={clsx("input-ez", className)} {...props} />
    </label>
  );
}

export function TextArea({ 
  label, 
  className, 
  ...props 
}: { 
  label: string 
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <textarea className={clsx("textarea-ez", className)} {...props} />
    </label>
  );
}

export function SelectField({ 
  label, 
  className, 
  children, 
  ...props 
}: { 
  label: string 
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block mb-4">
      <span className="label-ez">{label}</span>
      <select className={clsx("select-ez", className)} {...props}>
        {children}
      </select>
    </label>
  );
}

interface FieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  value: any;
  onChange: (value: any) => void;
  options?: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export default function Field({ 
  label, 
  type, 
  value, 
  onChange, 
  options, 
  placeholder, 
  helperText, 
  required 
}: FieldProps) {
  if (type === 'checkbox' && options) {
    return (
      <div className="form-group">
        <label>{label} {required && <span style={{ color: '#ff6b11' }}>*</span>}</label>
        <div className="checkbox-group">
          {options.map((option) => (
            <div 
              key={option} 
              className={`checkbox-item ${value?.includes(option) ? 'checked' : ''}`}
              onClick={() => {
                const currentValues = value || [];
                if (currentValues.includes(option)) {
                  onChange(currentValues.filter((v: string) => v !== option));
                } else {
                  onChange([...currentValues, option]);
                }
              }}
            >
              <input
                type="checkbox"
                checked={value?.includes(option) || false}
                onChange={() => {}}
                style={{ pointerEvents: 'none' }}
              />
              <label style={{ margin: 0, cursor: 'pointer' }}>{option}</label>
            </div>
          ))}
        </div>
        {helperText && <p style={{ fontSize: '13px', color: '#8f8f91', marginTop: '8px' }}>{helperText}</p>}
      </div>
    );
  }

  if (type === 'select' && options) {
    return (
      <div className="form-group">
        <label>{label} {required && <span style={{ color: '#ff6b11' }}>*</span>}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {helperText && <p style={{ fontSize: '13px', color: '#8f8f91', marginTop: '8px' }}>{helperText}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="form-group">
        <label>{label} {required && <span style={{ color: '#ff6b11' }}>*</span>}</label>
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
        />
        {helperText && <p style={{ fontSize: '13px', color: '#8f8f91', marginTop: '8px' }}>{helperText}</p>}
      </div>
    );
  }

  return (
    <div className="form-group">
      <label>{label} {required && <span style={{ color: '#ff6b11' }}>*</span>}</label>
      <input 
        type={type}
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        required={required}
      />
      {helperText && <p style={{ fontSize: '13px', color: '#8f8f91', marginTop: '8px' }}>{helperText}</p>}
    </div>
  );
}