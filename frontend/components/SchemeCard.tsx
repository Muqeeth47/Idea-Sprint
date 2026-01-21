import React from 'react';
import { MousePointerClick } from 'lucide-react';

interface SchemeCardProps {
    scheme: any;
    onCheck: (scheme: any) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onCheck }) => {
    return (
        <div className="glass-panel p-8 border border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col h-full animate-fade-in group hover:shadow-2xl hover:shadow-primary/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center flex-grow">
                <div className="mb-4">
                    <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-3">
                        {Math.round(scheme.score * 100)}% MATCH
                    </span>
                    <h3 className="text-2xl font-bold text-white leading-tight mb-1">{scheme.scheme_name}</h3>
                </div>

                <div className="mb-6 w-full">
                    <span className="text-xs text-text-muted uppercase tracking-widest block mb-2 font-semibold">Category</span>
                    <span className="inline-block px-4 py-1.5 rounded-lg bg-white/5 text-gray-200 text-sm border border-white/10">
                        {scheme.category}
                    </span>
                </div>

                <div className="mb-8 w-full">
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed px-2">
                        {scheme.details}
                    </p>
                </div>

                <div className="mt-auto w-full pt-6 border-t border-white/5">
                    <button
                        onClick={() => onCheck(scheme)}
                        className="primary-button w-full flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-lg"
                    >
                        <MousePointerClick size={18} />
                        Check Eligibility
                    </button>
                </div>
            </div>
        </div>
    );
};
