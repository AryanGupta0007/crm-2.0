interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false 
}: InputProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-coral-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maritime-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-coral-500 bg-coral-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      />
      {error && (
        <p className="text-sm text-coral-600">{error}</p>
      )}
    </div>
  );
};