import React, { useEffect, useState } from 'react';
import './ProductsPage.css';
import { api } from '../../api';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            alert('Ошибка загрузки товаров');
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setModalMode('create');
        setEditingProduct(null);
        setModalOpen(true);
    }

    function openEdit(product) {
        setModalMode('edit');
        setEditingProduct(product);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingProduct(null);
    }

    async function handleDelete(id) {
        const isConfirmed = window.confirm('Удалить товар?');

        if (!isConfirmed) {
            return;
        }

        try {
            await api.deleteProduct(id);
            setProducts(prev => prev.filter(product => product.id !== id));
        } catch (error) {
            alert('Ошибка удаления товара');
        }
    }

    async function handleSubmit(payload) {
        try {
            if (modalMode === 'create') {
                const newProduct = await api.createProduct(payload);
                setProducts(prev => [...prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts(prev => prev.map(product => product.id === payload.id ? updatedProduct : product));
            }

            closeModal();
        } catch (error) {
            alert('Ошибка сохранения товара');
        }
    }

    return (
        <div className="page">
            <header className="header">
                <div className="container header__inner">
                    <div className="brand">Products App</div>
                    <div className="header__right">React + Express</div>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Интернет-магазин</h1>
                        <button className="btn btn--primary" onClick={openCreate}>Добавить товар</button>
                    </div>
                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductsList products={products} onEdit={openEdit} onDelete={handleDelete} />
                    )}
                </div>
            </main>
            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
