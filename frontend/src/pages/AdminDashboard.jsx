// ========================================================================
// MODULE 2: React — Conditional Rendering, Fetching, Async/Await
// ========================================================================
// Topics: useEffect, useState, Async/Await, Conditional Rendering,
//         Fetching multiple endpoints, Styling in React
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    // STATE: Object with multiple properties
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });

    // --- FETCHING multiple API endpoints ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // Fetch data from two different endpoints
                const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
                const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);

                // Update state with fetched data
                setStats({
                    users: 0,                          // Placeholder (no users endpoint)
                    products: productsRes.data.length,  // .length = array length
                    orders: ordersRes.data.length
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []); // Empty array = run once on mount

    return (
        <div className="container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>
                {/* CSS Grid for stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Stat cards — Styling in React using inline styles */}
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(79, 70, 229, 0.2)' }}>
                        <h3 style={{ fontSize: '3rem', margin: '0' }}>{stats.users}</h3>
                        <p>Total Users</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(236, 72, 153, 0.2)' }}>
                        <h3 style={{ fontSize: '3rem', margin: '0' }}>{stats.products}</h3>
                        <p>Total Products</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.2)' }}>
                        <h3 style={{ fontSize: '3rem', margin: '0' }}>{stats.orders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
