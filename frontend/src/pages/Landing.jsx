import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Menu, X, ArrowRight, Play, Check, ChevronDown, Star, Lock, Zap,
  GraduationCap, Smartphone, TrendingUp, Wallet, Bot, Calendar, DollarSign,
  AlertTriangle, CheckCircle, AlertCircle, BarChart3, ShoppingBag, Bus,
  BookOpen, Gamepad2, Heart, Home, Lightbulb, Briefcase
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [survivalDays, setSurvivalDays] = useState(15);
  const [counts, setCounts] = useState({ stat1: 0, stat2: 0, stat3: 0 });
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Count-up animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount('stat1', 78, 2000);
          animateCount('stat2', 0, 1500);
          animateCount('stat3', 3, 2000);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = (key, target, duration) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCounts(prev => ({ ...prev, [key]: target }));
        clearInterval(timer);
      } else {
        setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
      }
    }, 16);
  };

  const getRiskLevel = (days) => {
    if (days <= 3) return { level: 'CRITICAL', color: '#EF4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)', icon: '🚨' };
    if (days <= 7) return { level: 'WARNING', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', icon: '⚠️' };
    return { level: 'SAFE', color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', icon: '✅' };
  };

  const risk = getRiskLevel(survivalDays);

  const faqs = [
    { q: 'Is Emergency Buffer Builder really free?', a: 'Yes. Every feature is free for students. No credit card, no trial period, no hidden fees. We believe financial safety should be accessible to everyone.' },
    { q: 'How is survival days calculated?', a: "It's simple: Emergency Fund Balance ÷ Your Average Daily Spending over the last 30 days. If your fund is ₹12,000 and you spend ₹500/day, you have 24 survival days." },
    { q: 'Is my financial data secure?', a: 'All data is encrypted in transit and at rest. We use JWT authentication and store zero payment information. Your data is never sold or shared.' },
    { q: 'What is the Vault Lock feature?', a: 'It prevents you from withdrawing from your emergency fund for a set period (7, 14, or 30 days). Research shows commitment devices like locks dramatically improve savings success rates.' },
    { q: 'Does it connect to my bank account?', a: 'No. You manually log transactions. This is intentional — research shows manual logging builds stronger financial awareness than automatic imports.' },
    { q: 'What does the chatbot do?', a: "It's a rule-based financial advisor that knows your data. Ask it anything: 'Can I spend ₹500?' or 'Why am I broke?' — it analyzes your spending patterns and gives personalized answers." },
  ];

  return (
    <div style={{ backgroundColor: '#070C18', minHeight: '100vh', color: '#F0F4FF', position: 'relative', overflow: 'hidden' }}>
      {/* Background Effects */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(0,212,255,0.07)', filter: 'blur(120px)', animation: 'float 6s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(16,185,129,0.05)', filter: 'blur(120px)', animation: 'float 6s ease-in-out infinite 3s' }}></div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar - Already created, keeping it */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.4s ease',
          backgroundColor: isScrolled ? 'rgba(7, 12, 24, 0.85)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid #1E2D4A' : 'none',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '22px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #00D4FF, #0099bb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              }}>
                <Shield size={20} color="#070C18" />
              </div>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem' }}>Buffer</span>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="hidden md:flex">
              <a href="#features" style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 500, color: '#5A7090', transition: 'color 0.2s' }}>Features</a>
              <a href="#how-it-works" style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 500, color: '#5A7090', transition: 'color 0.2s' }}>How It Works</a>
              <a href="#testimonials" style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 500, color: '#5A7090', transition: 'color 0.2s' }}>Testimonials</a>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={() => navigate('/login')} className="hidden md:block" style={{
                padding: '10px 22px', borderRadius: '10px', border: '1px solid #1E2D4A',
                backgroundColor: 'transparent', color: '#F0F4FF', fontFamily: 'Outfit', fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer'
              }}>Login</button>
              <button onClick={() => navigate('/register')} style={{
                padding: '10px 22px', borderRadius: '10px', backgroundColor: '#00D4FF', color: '#070C18',
                fontFamily: 'Outfit', fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer'
              }}>Get Started</button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden" style={{ color: '#F0F4FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'fixed', top: '80px', left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(7, 12, 24, 0.98)', backdropFilter: 'blur(20px)', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px'
          }}>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 500, color: '#F0F4FF' }}>Features</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 500, color: '#F0F4FF' }}>How It Works</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 500, color: '#F0F4FF' }}>Testimonials</a>
          </div>
        )}

        {/* Hero Section */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '160px 24px 100px', textAlign: 'center' }}>
          <div style={{ maxWidth: '860px', margin: 'auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px',
              border: '1px solid rgba(0, 212, 255, 0.25)', backgroundColor: 'rgba(0, 212, 255, 0.08)', marginBottom: '32px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s ease-in-out infinite' }}></div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 600, color: '#00D4FF' }}>Built for Indian Students · Free Forever</span>
            </div>

            <h1 style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontStyle: 'italic', lineHeight: 1.1 }}>Stop Living</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontStyle: 'italic', lineHeight: 1.1 }}>Paycheck to</div>
              <div style={{
                fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontStyle: 'italic',
                background: 'linear-gradient(90deg, #00D4FF, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1
              }}>Paycheck.</div>
            </h1>

            <p style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 300, lineHeight: 1.8, color: '#5A7090', maxWidth: '580px', margin: '0 auto 40px' }}>
              Emergency Buffer Builder helps students track spending, build emergency savings, and know exactly how many days they can survive a financial crisis — in real time.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button onClick={() => navigate('/register')} style={{
                padding: '16px 32px', borderRadius: '12px', backgroundColor: '#00D4FF', color: '#070C18',
                fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
              }}>
                Start Building Your Buffer <ArrowRight size={20} />
              </button>
            </div>

            <p style={{ fontFamily: 'Outfit', fontSize: '0.82rem', color: '#5A7090', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Lock size={14} /> No credit card · <GraduationCap size={14} /> Student-first · <Smartphone size={14} /> Works on all devices
            </p>

            {/* Dashboard Preview */}
            <div style={{ marginTop: '60px', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{
                border: '1px solid #1E2D4A', borderRadius: '20px', backgroundColor: '#111D32',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.1)', overflow: 'hidden'
              }}>
                <div style={{ padding: '12px', borderBottom: '1px solid #1E2D4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                  <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: '#5A7090' }}>app.bufferbuilder.in</div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {[
                      { label: 'Emergency Fund', value: '₹12,400', color: '#00D4FF', sub: '+₹500 today' },
                      { label: 'Survival Days', value: '23 days', color: '#10B981', sub: 'SAFE ✓' },
                      { label: 'Avg Daily Spend', value: '₹487', color: '#F0F4FF', sub: 'Last 30 days' },
                      { label: 'Monthly Budget', value: '₹8,000', color: '#5A7090', sub: '₹2,340 left' }
                    ].map((stat, i) => (
                      <div key={i} style={{ backgroundColor: '#0D1424', border: '1px solid #1E2D4A', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.7rem', color: '#5A7090', marginBottom: '4px' }}>{stat.label}</div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: stat.color, marginBottom: '2px' }}>{stat.value}</div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.65rem', color: '#5A7090' }}>{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#F0F4FF' }}>23 of 30 days runway</span>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#5A7090' }}>77%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1E2D4A', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, #00D4FF, #10B981)', borderRadius: '4px', animation: 'fillBar 1.5s ease-out forwards' }}></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem' }}>
                    {[
                      { emoji: '🍔', desc: 'Swiggy Order', cat: 'Food', amount: '-₹340', date: 'Today' },
                      { emoji: '🚌', desc: 'Bus Pass', cat: 'Transport', amount: '-₹200', date: 'Yesterday' },
                      { emoji: '📚', desc: 'Book Purchase', cat: 'Education', amount: '-₹450', date: '2 days ago' }
                    ].map((tx, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < 2 ? '1px solid #1E2D4A' : 'none' }}>
                        <span style={{ fontSize: '1.2rem' }}>{tx.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#F0F4FF' }}>{tx.desc}</div>
                          <div style={{ fontFamily: 'Outfit', fontSize: '0.65rem', color: '#5A7090' }}>{tx.cat}</div>
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: '#EF4444' }}>{tx.amount}</div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '0.65rem', color: '#5A7090' }}>{tx.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continue in next part... */}
      </div>

      {/* Footer with Contact Information */}
      <footer style={{
        background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
        borderTop: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '3rem 1rem',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Company Info */}
            <div>
              <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.5rem', color: '#00D4FF', marginBottom: '1rem' }}>
                Emergency Buffer Builder
              </h3>
              <p style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                Building Financial Safety Nets for Students
              </p>
              <p style={{ fontFamily: 'Outfit', color: '#64748B', fontSize: '0.75rem' }}>
                Founded by Kirtan Jogani
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', color: '#FFFFFF', marginBottom: '1rem', fontWeight: '600' }}>
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="mailto:kirtanjogani3@gmail.com" style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📧 kirtanjogani3@gmail.com
                </a>
                <a href="tel:+919374134341" style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📱 +91-9374134341
                </a>
                <div style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💳 emergencybuffer@paytm
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', color: '#FFFFFF', marginBottom: '1rem', fontWeight: '600' }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => navigate('/login')} style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  Login
                </button>
                <button onClick={() => navigate('/register')} style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  Register
                </button>
                <a href="http://localhost:8000/api/docs" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none' }}>
                  API Docs
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', color: '#FFFFFF', marginBottom: '1rem', fontWeight: '600' }}>
                Support Hours
              </h4>
              <div style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.8' }}>
                <div>📧 Email: 24/7</div>
                <div>📱 Phone: 9 AM - 9 PM IST</div>
                <div style={{ marginTop: '0.5rem', color: '#64748B', fontSize: '0.75rem' }}>
                  Monday - Saturday
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontFamily: 'Outfit', color: '#64748B', fontSize: '0.875rem' }}>
              © 2026 Emergency Buffer Builder. All rights reserved.
            </div>
            <div style={{ fontFamily: 'Outfit', color: '#64748B', fontSize: '0.875rem' }}>
              Made with ❤️ by Kirtan Jogani
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fillBar { from { width: 0; } to { width: 77%; } }
        @media (max-width: 768px) { .hidden { display: none !important; } .md\\:flex { display: flex !important; } .md\\:block { display: block !important; } }
      `}</style>
    </div>
  );
};

export default Landing;
