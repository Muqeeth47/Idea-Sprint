import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEligibility } from '../lib/api';

interface Props {
    scheme: any;
    onClose: () => void;
}

export const VerificationModal: React.FC<Props> = ({ scheme, onClose }) => {
    const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
    const [formData, setFormData] = useState({
        age: '',
        income: '',
        gender: 'Male',
        caste: '',
        occupation: ''
    });
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        try {
            // Sanitize inputs
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : undefined,
                income: formData.income ? parseInt(formData.income) : undefined
            };
            const res = await verifyEligibility(scheme.scheme_name, payload);
            setResult(res);
            setStep('result');
        } catch (err) {
            alert("Error verifying eligibility");
            setStep('input');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{scheme.scheme_name}</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-purple-600 rounded-full"></div>
                </div>

                {step === 'input' && (
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                        <h3 className="text-lg text-gray-300 mb-6 font-medium">Enter your details to check eligibility</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                            <div>
                                <label className="block text-sm text-text-muted mb-2 font-medium ml-1 text-center">Age</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.age}
                                    placeholder="Years"
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2 font-medium ml-1 text-center">Annual Income (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.income}
                                    placeholder="₹ 0.00"
                                    onChange={e => setFormData({ ...formData, income: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2 font-medium ml-1 text-center">Gender</label>
                                <select
                                    className="input-field cursor-pointer"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="Male" className="text-black">Male</option>
                                    <option value="Female" className="text-black">Female</option>
                                    <option value="Other" className="text-black">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2 font-medium ml-1 text-center">Caste / Category</label>
                                <select
                                    className="input-field cursor-pointer"
                                    value={formData.caste}
                                    onChange={e => setFormData({ ...formData, caste: e.target.value })}
                                >
                                    <option value="General" className="text-black">General</option>
                                    <option value="SC" className="text-black">Scheduled Caste (SC)</option>
                                    <option value="ST" className="text-black">Scheduled Tribe (ST)</option>
                                    <option value="OBC" className="text-black">Other Backward Class (OBC)</option>
                                    <option value="Minority" className="text-black">Minority</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-text-muted mb-2 font-medium ml-1 text-center">Occupation</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Student, Farmer, Artisan"
                                    value={formData.occupation}
                                    onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" className="primary-button w-full shadow-xl hover:shadow-2xl">
                                Verify Eligibility
                            </button>
                        </div>
                    </form>
                )}

                {step === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                            <Loader2 className="animate-spin text-primary relative z-10" size={64} />
                        </div>
                        <p className="text-text-muted mt-8 text-lg animate-pulse">Analyzing profile against scheme criteria...</p>
                    </div>
                )}

                {step === 'result' && result && (
                    <div className="space-y-8 animate-fade-in">
                        <div className={`p-8 rounded-2xl border ${result.verdict === 'ELIGIBLE' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} backdrop-blur-md`}>
                            <div className="flex flex-col items-center gap-4 mb-6">
                                {result.verdict === 'ELIGIBLE' ? (
                                    <div className="p-4 rounded-full bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <CheckCircle className="text-green-500" size={48} />
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-full bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                        <XCircle className="text-red-500" size={48} />
                                    </div>
                                )}
                                <h3 className={`text-4xl font-bold tracking-tight ${result.verdict === 'ELIGIBLE' ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.verdict}
                                </h3>
                            </div>

                            <div className="text-center max-w-md mx-auto space-y-2">
                                {result.reasons.map((r: string, i: number) => (
                                    <p key={i} className="text-gray-200 text-lg leading-relaxed">{r}</p>
                                ))}
                            </div>
                        </div>

                        {result.verdict === 'ELIGIBLE' && (
                            <div className="space-y-4 animate-fade-in text-left">
                                <div className="glass-panel p-6 bg-white/5 hover:bg-white/10 transition-colors">
                                    <h4 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Primary Benefits
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed pl-4 border-l border-white/10 ml-1">{result.scheme_details.benefits}</p>
                                </div>
                                <div className="glass-panel p-6 bg-white/5 hover:bg-white/10 transition-colors">
                                    <h4 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Required Documents
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed pl-4 border-l border-white/10 ml-1">{result.scheme_details.documents}</p>
                                </div>
                                <div className="glass-panel p-6 bg-white/5 hover:bg-white/10 transition-colors">
                                    <h4 className="font-bold text-primary mb-3 text-lg flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Application Steps
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed pl-4 border-l border-white/10 ml-1">{result.scheme_details.application}</p>
                                </div>
                            </div>
                        )}

                        <button onClick={onClose} className="w-full py-4 text-text-muted hover:text-white font-medium hover:bg-white/5 rounded-xl transition-all">
                            Close Verification
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
