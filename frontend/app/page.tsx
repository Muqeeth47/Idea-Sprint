'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { searchSchemes } from '../lib/api';
import { SchemeCard } from '../components/SchemeCard';
import { VerificationModal } from '../components/VerificationModal';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await searchSchemes(query);
            if (res.status === 'success') {
                setResults(res.results);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pb-20 bg-grid">
            {/* Header */}
            <header className="navbar">
                <div className="container mx-auto px-6 navbar-content">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white">
                            S
                        </div>
                        <span className="font-bold text-lg heading-gradient">SchemeBot</span>
                    </div>
                    <nav>
                        {/* Placeholder for future links */}
                        <span className="text-sm text-text-muted hover:text-white cursor-pointer transition-colors">About</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[600px] flex flex-col items-center justify-center p-6 text-center overflow-hidden pt-20">

                <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary uppercase tracking-widest backdrop-blur-md animate-fade-in shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#34d399]"></span>
                    AI Powered Analysis
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 heading-gradient drop-shadow-lg tracking-tight">
                    Find Schemes <br className="hidden md:block" /> You Qualify For
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                    AI-powered discovery for government schemes. Enter your profile or needs to get started.
                </p>

                <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <input
                        type="text"
                        placeholder="e.g., 'scholarship for st student' or 'pension for widow'"
                        className="w-full pl-6 pr-14 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xl transition-all text-center text-lg relative z-10"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/80 text-white p-3 rounded-full transition-all hover:scale-110 shadow-lg z-20"
                    >
                        <Search size={24} />
                    </button>
                </form>
            </section>

            {/* Results Section */}
            <section className="container mx-auto px-6 -mt-10 relative z-10 pb-20">
                {loading && (
                    <div className="text-center py-20 glass-panel max-w-lg mx-auto">
                        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Analyzing Schemes</h3>
                        <p className="text-text-muted">finding the best matches for you...</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {results.map((scheme, idx) => (
                            <SchemeCard
                                key={idx}
                                scheme={scheme}
                                onCheck={setSelectedScheme}
                            />
                        ))}
                    </div>
                )}

                {!loading && results.length === 0 && query && (
                    <div className="text-center py-16 text-gray-400 glass-panel max-w-lg mx-auto flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No schemes found</h3>
                        <p className="max-w-xs mx-auto">We couldn't find any schemes matching "{query}". Try different keywords.</p>
                    </div>
                )}
            </section>

            {/* Modal */}
            {selectedScheme && (
                <VerificationModal
                    scheme={selectedScheme}
                    onClose={() => setSelectedScheme(null)}
                />
            )}
        </main>
    );
}
