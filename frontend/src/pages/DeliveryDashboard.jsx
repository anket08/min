// ========================================================================
// MODULE 2: React — State Management, Fetching, Event Handling
// ========================================================================
// Topics: useState, useEffect, Async/Await, Event Handling, AJAX,
//         Array methods (map, sort), Conditional Rendering
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]); // State: array of orders

    // --- FETCH orders from API ---
    const fetchOrders = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }, // JWT auth header
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);
            // ARRAY METHOD: sort() — sorts by date (newest first)
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchOrders(); }, []); // Fetch on mount

    // --- UPDATE order status (PUT request) ---
    const updateStatus = async (id, status) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            // PUT request = UPDATE operation
            await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, { status }, config);
            fetchOrders(); // RE-FETCH after update
        } catch (error) {
            alert('Error updating status'); // Dialog box
        }
    };

    return (
        <div className="container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem' }}>Delivery Dashboard</h2>
                <div>
                    {/* ARRAY METHOD: map() — render each order */}
                    {orders.map(order => (
                        <div key={order._id} className="glass-panel" style={{
                            padding: '1rem', marginBottom: '1rem',
                            borderTop: `4px solid ${order.status === 'delivered' ? 'var(--success)' : 'var(--accent)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <strong>Order #{order._id.substring(0, 8)}</strong>
                                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--surface)', borderRadius: '0.25rem' }}>{order.status}</span>
                            </div>
                            {/* Optional chaining (?.) — safely access nested property */}
                            <p style={{ margin: '0.5rem 0' }}>Customer: {order.user?.name || 'Unknown'}</p>
                            <div style={{ margin: '1rem 0', maxHeight: '100px', overflowY: 'auto' }}>
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {item.qty}x {item.name}
                                    </div>
                                ))}
                            </div>
                            {/* Conditional: show button only if not delivered */}
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                {order.status !== 'delivered' && (
                                    <button className="btn btn-primary" onClick={() => updateStatus(order._id, 'delivered')} style={{ width: '100%' }}>
                                        <CheckCircle size={16} style={{ marginRight: '0.5rem' }} /> Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <p>No orders found.</p>}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
