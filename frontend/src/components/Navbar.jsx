// ========================================================================
// MODULE 2: React — Reusable React Component
// ========================================================================
// Topics: Reusable Components, Props, Conditional Rendering,
//         useContext, Event Handling, Inline Styles, Linking (React Router)
// ========================================================================

import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ShoppingCart, Disc } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cart count state — reads from localStorage
    const [cartCount, setCartCount] = useState(0);

    // Update cart count on mount and whenever localStorage changes
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        setCartCount(total);
    };

    useEffect(() => {
        updateCartCount();
        // Listen for custom 'cartUpdated' event (fired from StudentDashboard)
        window.addEventListener('cartUpdated', updateCartCount);
        // Also poll every second as fallback
        const interval = setInterval(updateCartCount, 1000);
        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{
                    fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    letterSpacing: '-0.02em', textTransform: 'uppercase'
                }}>
                    <Disc size={20} color="var(--primary)" />
                    MINIT
                </Link>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {user.role === 'student' && (
                                <>
                                    <Link to="/myorders" className="font-mono nav-link" style={{
                                        color: 'var(--text-muted)', fontSize: '0.85rem'
                                    }}>ORDERS</Link>

                                    {/* Cart icon with count badge */}
                                    <Link to="/cart" style={{
                                        display: 'flex', alignItems: 'center',
                                        color: 'var(--text)', position: 'relative'
                                    }}>
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-10px', right: '-12px',
                                                background: '#ef4444', color: 'white', borderRadius: '50%',
                                                width: '20px', height: '20px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 'bold',
                                                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
                                                animation: 'popIn 0.3s ease'
                                            }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary" style={{
                                padding: '0.4rem 0.8rem', fontSize: '0.8rem'
                            }}>
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" style={{
                                color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500'
                            }}>Login</Link>
                            <Link to="/register" className="nav-link" style={{
                                color: 'var(--text)', fontSize: '0.9rem', fontWeight: '600'
                            }}>Register</Link>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0); }
                    70% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
