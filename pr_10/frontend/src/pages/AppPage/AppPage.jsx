import React, { useEffect, useState } from 'react';
import './AppPage.css';
import { api } from '../../api';
import AuthForm from '../../components/AuthForm';
import ProductForm from '../../components/ProductForm';
import ProductsSection from '../../components/ProductsSection';

export default function AppPage() {
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            loadProfile();
            loadProducts();
        }
    }, []);

    async function loadProfile() {
        try {
            const data = await api.me();
            setProfile(data);
        } catch (error) {
            setProfile(null);
        }
    }

    async function loadProducts() {
        try {
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            setProducts([]);
        }
    }

    async function handleRegister(payload) {
        try {
            await api.register(payload);
            alert('Пользователь создан');
        } catch (error) {
            alert('Ошибка регистрации');
        }
    }

    async function handleLogin(payload) {
        try {
            const data = await api.login(payload);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            await loadProfile();
            await loadProducts();
        } catch (error) {
            alert('Ошибка входа');
        }
    }

    async function handleProductSubmit(payload) {
        try {
            if (selectedProduct) {
                await api.updateProduct(selectedProduct.id, payload);
            } else {
                await api.createProduct(payload);
            }

            setSelectedProduct(null);
            await loadProducts();
        } catch (error) {
            alert('Ошибка сохранения товара');
        }
    }

    async function handleSelect(id) {
        try {
            const product = await api.getProductById(id);
            setSelectedId(id);
            setSelectedProduct(product);
            setDetail(product);
        } catch (error) {
            alert('Ошибка загрузки товара');
        }
    }

    async function handleDelete(id) {
        try {
            await api.deleteProduct(id);
            if (selectedId === id) {
                setSelectedId('');
                setSelectedProduct(null);
                setDetail(null);
            }
            await loadProducts();
        } catch (error) {
            alert('Ошибка удаления товара');
        }
    }

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setProfile(null);
        setProducts([]);
        setSelectedId('');
        setSelectedProduct(null);
        setDetail(null);
    }

    return (
        <div className="page">
            <div className="container">
                <div className="hero">
                    <h1 className="title">Практическая работа 10</h1>
                    <div className="subtitle">Хранение токенов на фронтенде и управление товарами</div>
                </div>
                {!profile ? (
                    <AuthForm onRegister={handleRegister} onLogin={handleLogin} />
                ) : (
                    <>
                        <div className="card profile">
                            <div>
                                <div className="card__title">{profile.first_name} {profile.last_name}</div>
                                <div className="row__text">{profile.email}</div>
                            </div>
                            <button className="btn" onClick={handleLogout}>Выйти</button>
                        </div>
                        <div className="layout">
                            <ProductForm
                                selectedProduct={selectedProduct}
                                onSubmit={handleProductSubmit}
                                onClear={() => setSelectedProduct(null)}
                            />
                            <ProductsSection
                                products={products}
                                selectedId={selectedId}
                                detail={detail}
                                onSelect={handleSelect}
                                onDelete={handleDelete}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
