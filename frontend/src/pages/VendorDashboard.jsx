// ========================================================================
// MODULE 2: React — CRUD UI, Form Processing, State, Graphs/Charts
// MODULE 1: JavaScript — Objects, Functions, Event Handling, Ajax, JSON
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Edit, Trash, X, TrendingUp, Package, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', stock: '', image: '' });
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'products'
    const [salesData, setSalesData] = useState(null);
    const [loadingSales, setLoadingSales] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    // Fetch products
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
            const myProducts = data.filter(p => p.vendor === user._id);
            setProducts(myProducts);
        } catch (error) { console.error(error); }
    };

    // Fetch sales data
    const fetchSales = async () => {
        try {
            setLoadingSales(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/vendor-sales`, config);
            setSalesData(data);
        } catch (error) { console.error(error); }
        finally { setLoadingSales(false); }
    };

    useEffect(() => { fetchProducts(); fetchSales(); }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, formData, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, config);
            }
            setShowForm(false);
            setFormData({ name: '', price: '', category: '', description: '', stock: '', image: '' });
            setEditingId(null);
            fetchProducts();
            fetchSales();
        } catch (error) { alert('Error saving product'); }
    };

    const handleEdit = (product) => {
        setFormData({ name: product.name, price: product.price, category: product.category, description: product.description, stock: product.stock, image: product.image });
        setEditingId(product._id);
        setShowForm(true);
        setActiveTab('products');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, config);
                fetchProducts();
                fetchSales();
            } catch (error) { alert('Error deleting product'); }
        }
    };

    // --- STAT CARD COMPONENT ---
    const StatCard = ({ icon, label, value, color }) => (
        <div className="glass-panel" style={{
            padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
            border: '1px solid var(--border)'
        }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${color}15`, border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)' }}>{value}</div>
            </div>
        </div>
    );

    // --- BAR CHART (pure CSS) ---
    const BarChart = ({ data, title }) => {
        if (!data || Object.keys(data).length === 0) return <p style={{ color: 'var(--text-muted)' }}>No sales data yet</p>;
        const maxVal = Math.max(...Object.values(data).map(d => d.qty || d));
        return (
            <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    <BarChart3 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />{title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(data).map(([name, val]) => {
                        const qty = typeof val === 'object' ? val.qty : val;
                        const revenue = typeof val === 'object' ? val.revenue : val;
                        const width = maxVal > 0 ? (qty / maxVal) * 100 : 0;
                        return (
                            <div key={name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                                        {typeof val === 'object' ? `${qty} sold • ₹${revenue}` : `₹${revenue}`}
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${width}%`,
                                        background: 'linear-gradient(90deg, var(--primary), rgba(200,155,60,0.6))',
                                        borderRadius: '4px', transition: 'width 1s ease'
                                    }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- REVENUE CHART (daily) ---
    const RevenueChart = ({ data }) => {
        if (!data || Object.keys(data).length === 0) return <p style={{ color: 'var(--text-muted)' }}>No revenue data yet</p>;
        const entries = Object.entries(data);
        const maxVal = Math.max(...Object.values(data));
        return (
            <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    <TrendingUp size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Daily Revenue
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '150px', padding: '0 0.5rem' }}>
                    {entries.map(([date, value]) => {
                        const height = maxVal > 0 ? (value / maxVal) * 100 : 0;
                        return (
                            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px'
                                }}>₹{value}</div>
                                <div style={{
                                    width: '100%', maxWidth: '40px',
                                    height: `${Math.max(height, 5)}%`,
                                    background: 'linear-gradient(180deg, var(--primary), rgba(200,155,60,0.3))',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease',
                                    minHeight: '4px'
                                }}></div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                                    {date.split('/').slice(0, 2).join('/')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: '20px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                {/* Header with tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2>Vendor Dashboard</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('dashboard')} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            <TrendingUp size={16} style={{ marginRight: '0.4rem' }} /> Sales
                        </button>
                        <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('products')} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                            <Package size={16} style={{ marginRight: '0.4rem' }} /> Products
                        </button>
                    </div>
                </div>

                {/* ===== SALES DASHBOARD TAB ===== */}
                {activeTab === 'dashboard' && (
                    <div>
                        {loadingSales ? (
                            <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
                                <div style={{ width: '40px', height: '40px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading sales data...</p>
                            </div>
                        ) : salesData ? (
                            <>
                                {/* Stat cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <StatCard icon={<DollarSign size={22} />} label="Total Revenue" value={`₹${salesData.totalRevenue}`} color="#22c55e" />
                                    <StatCard icon={<ShoppingBag size={22} />} label="Items Sold" value={salesData.totalItemsSold} color="#3b82f6" />
                                    <StatCard icon={<Package size={22} />} label="Products" value={salesData.totalProducts} color="#f59e0b" />
                                    <StatCard icon={<TrendingUp size={22} />} label="Total Orders" value={salesData.totalOrders} color="#8b5cf6" />
                                </div>

                                {/* Charts */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                        <BarChart data={salesData.salesByProduct} title="Sales by Product" />
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                        <RevenueChart data={salesData.salesByDate} />
                                    </div>
                                </div>

                                {/* Recent orders table */}
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        Recent Orders
                                    </h3>
                                    {salesData.recentOrders.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Customer</th>
                                                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Product</th>
                                                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Qty</th>
                                                        <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Revenue</th>
                                                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {salesData.recentOrders.map((order, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '0.75rem' }}>{order.customerName}</td>
                                                            <td style={{ padding: '0.75rem' }}>{order.productName}</td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{order.qty}</td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--primary)', fontWeight: '600' }}>₹{order.revenue}</td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                                <span style={{
                                                                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase',
                                                                    background: order.status === 'delivered' ? 'rgba(34,197,94,0.15)' : 'rgba(212,181,126,0.15)',
                                                                    color: order.status === 'delivered' ? 'var(--success)' : 'var(--primary)'
                                                                }}>{order.status.replace('_', ' ')}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)' }}>No orders yet. Sales will appear here.</p>
                                    )}
                                </div>
                            </>
                        ) : <p>Failed to load sales data</p>}
                    </div>
                )}

                {/* ===== PRODUCTS TAB ===== */}
                {activeTab === 'products' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                            <button className="btn btn-primary" onClick={() => {
                                setShowForm(!showForm); setEditingId(null);
                                setFormData({ name: '', price: '', category: '', description: '', stock: '', image: '' });
                            }}>
                                {showForm ? <X /> : <Plus />} {showForm ? 'Close' : 'Add Product'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', textTransform: 'uppercase' }}>
                                    {editingId ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required
                                        style={{ padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                                    <input name="price" type="number" placeholder="Price (₹)" value={formData.price} onChange={handleChange} required
                                        style={{ padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                                    <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required
                                        style={{ padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                                    <input name="stock" type="number" placeholder="Stock Qty" value={formData.stock} onChange={handleChange} required
                                        style={{ padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                                    <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange}
                                        style={{ padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required
                                        style={{ gridColumn: '1 / -1', padding: '0.8rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', minHeight: '100px', resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Product</button>
                                </div>
                            </form>
                        )}

                        {products.map(product => (
                            <div key={product._id} className="glass-panel" style={{
                                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'
                            }}>
                                <div style={{ height: '150px', background: '#334155', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                    {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>No Image</div>}
                                </div>
                                <h3 style={{ margin: '0.5rem 0 0' }}>{product.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{product.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.price}</span>
                                        <span style={{
                                            marginLeft: '0.75rem', fontSize: '0.8rem',
                                            color: product.stock > 0 ? 'var(--success)' : '#ef4444',
                                            fontWeight: '600'
                                        }}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(product)} style={{ padding: '0.4rem', marginRight: '0.5rem' }}><Edit size={16} /></button>
                                        <button className="btn btn-secondary" onClick={() => handleDelete(product._id)} style={{ padding: '0.4rem', color: 'var(--danger)' }}><Trash size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && !showForm && <p>No products found. Add one!</p>}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VendorDashboard;
