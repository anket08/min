// ========================================================================
// MODULE 1: HTML5 — Page Structure Elements, Headings, Linking, Images
// MODULE 1: CSS — Inline Styles, Backgrounds, Text Shadows
// ========================================================================
// Topics: HTML5 Page Structure (<header>, <nav>, <main>, <footer>, <section>),
//         Headings (h1), Linking (React Router Link), Images,
//         Inline Styles, Text Shadows, CSS Animations
// ========================================================================

import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        // Main container — acts like a full-page layout
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* ===== BACKGROUND ELEMENTS ===== */}
            <div className="stars-container">
                <div className="stars-1"></div>
                <div className="stars-2"></div>
                <div className="stars-3"></div>
            </div>
            <div className="wireframe-grid"></div>

            {/* ===== HTML5 PAGE STRUCTURE: <nav> ===== */}
            {/* <nav> = semantic HTML5 element for navigation */}
            <nav style={{
                position: 'absolute',   // POSITIONING: absolute (relative to parent)
                top: 0,
                left: 0,
                width: '100%',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                background: 'transparent'
            }}>
                <div style={{ fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.05em', color: 'var(--text)' }}>MINIT</div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                </div>
            </nav>

            {/* ===== 3D Polygon Background ===== */}
            <div className="polygon-container">
                <div className="polygon">
                    <div className="polygon-face f1"></div>
                    <div className="polygon-face f2"></div>
                    <div className="polygon-face f3"></div>
                    <div className="polygon-face f4"></div>
                    <div className="polygon-face f5"></div>
                    <div className="polygon-face f6"></div>
                    <div className="polygon-face f7"></div>
                    <div className="polygon-face f8"></div>
                    <div className="polygon-face f9"></div>
                    <div className="polygon-face f10"></div>
                </div>
            </div>

            {/* ===== HTML5 PAGE STRUCTURE: <main> ===== */}
            {/* <main> = semantic HTML5 element for the main content of the page */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Status badge */}
                <div style={{
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: 'rgba(20, 20, 20, 0.6)',
                    marginBottom: '2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                        V1.0 (BETA) // SYSTEM NOMINAL
                    </span>
                </div>

                {/* ===== HTML5 HEADING: <h1> ===== */}
                {/* TEXT SHADOW — adds glow effect behind text */}
                {/* textShadow: 'x-offset y-offset blur-radius color' */}
                <h1 style={{
                    fontSize: 'clamp(5rem, 15vw, 12rem)',  // Responsive font size using clamp()
                    lineHeight: '0.8',
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 2,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                    textShadow: '0 0 50px rgba(245, 158, 11, 0.3)'  // TEXT SHADOW
                }}>
                    MINIT
                </h1>

                {/* Subtext */}
                <div style={{ marginTop: '2rem', maxWidth: '600px', backdropFilter: 'blur(3px)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        The accountability engine for campus essentials.<br />
                        <span style={{ color: 'var(--text)', fontWeight: '600' }}>Cold. Mechanical. Honest.</span>
                    </p>
                </div>

                {/* ===== LINKING (React Router) ===== */}
                {/* <Link to="/login"> = internal link using React Router (no page reload) */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    gap: '1rem',
                }}>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                        Login
                    </Link>
                </div>
            </main>

            {/* ===== HTML5 PAGE STRUCTURE: <footer> ===== */}
            {/* <footer> = semantic HTML5 element for page footer */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                borderTop: '1px solid var(--border)'
            }}>
                <div className="font-mono">
                    SYSTEM STATUS: OPTIMAL • LATENCY: 12MS • ENCRYPTION: 256-BIT
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
