import { useState } from "react";

function InputField({ label, type = "text", value, onChange, error, placeholder }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="mb-4">
            <label className="block text-slate-400 text-xs font-medium mb-1.5">{label}</label>
            <input
                type={type} value={value} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#252535] text-white text-sm outline-none font-sans placeholder:text-slate-600 transition-all
          ${error ? "border border-rose-500/70" : focused ? "border border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" : "border border-white/[0.09]"}`}
            />
            {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default InputField;