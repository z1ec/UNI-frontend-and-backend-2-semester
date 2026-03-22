import React, { useEffect, useState } from 'react';
import './AppPage.css';
import { api } from '../../api';
import AuthForm from '../../components/AuthForm';
import ProductForm from '../../components/ProductForm';
import ProductsSection from '../../components/ProductsSection';
import UsersSection from '../../components/UsersSection';

export default function AppPage() {
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            loadAll();
        }
    }, []);

    async function loadAll() {
        try {
            const currentUser = await api.me();
            setProfile(currentUser);
            const productsData = await api.getProducts();
            setProducts(productsData);

            if (currentUser.role === 'admin') {
                const usersData = await api.getUsers();
                setUsers(usersData);
            }
        } catch (error) {
            setProfile(null);
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
            await loadAll();
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
            setDetail(null);
            await loadAll();
        } catch (error) {
            alert('Ошибка сохранения товара');
        }
    }

    async function handleSelectProduct(id) {
        try {
            const product = await api.getProductById(id);
            setSelectedProduct(product);
            setDetail(product);
        } catch (error) {
            alert('Ошибка загрузки товара');
        }
    }

    async function handleDeleteProduct(id) {
        try {
            await api.deleteProduct(id);
            setSelectedProduct(null);
            setDetail(null);
            await loadAll();
        } catch (error) {
            alert('Ошибка удаления товара');
        }
    }

    async function handleUpdateUser(id, user) {
        try {
            await api.updateUser(id, {
                first_name: user.first_name,
                last_name: user.last_name,
                role: 'admin'
            });
            await loadAll();
        } catch (error) {
            alert('Ошибка обновления пользователя');
        }
    }

    async function handleBlockUser(id) {
        try {
            await api.deleteUser(id);
            await loadAll();
        } catch (error) {
            alert('Ошибка блокировки пользователя');
        }
    }

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setProfile(null);
        setProducts([]);
        setUsers([]);
        setSelectedProduct(null);
        setDetail(null);
    }

    const canEditProducts = profile && (profile.role === 'seller' || profile.role === 'admin');
    const canDeleteProducts = profile && profile.role === 'admin';

    return (
        <div className="page">
            <div className="container">
                <div className="hero">
                    <h1 className="title">Практическая работа 11</h1>
                    <div className="subtitle">RBAC для товаров и пользователей</div>
                </div>
                {!profile ? (
                    <AuthForm onRegister={handleRegister} onLogin={handleLogin} />
                ) : (
                    <>
                        <div className="card profile">
                            <div>
                                <div className="card__title">{profile.first_name} {profile.last_name}</div>
                                <div className="row__text">{profile.email}</div>
                                <div className="row__text">Роль: {profile.role}</div>
                            </div>
                            <button className="btn" onClick={handleLogout}>Выйти</button>
                        </div>
                        <div className="layout">
                            <ProductForm
                                selectedProduct={selectedProduct}
                                canEdit={canEditProducts}
                                onSubmit={handleProductSubmit}
                                onClear={() => setSelectedProduct(null)}
                            />
                            <ProductsSection
                                products={products}
                                detail={detail}
                                canDelete={canDeleteProducts}
                                onSelect={handleSelectProduct}
                                onDelete={handleDeleteProduct}
                            />
                        </div>
                        {profile.role === 'admin' && (
                            <UsersSection users={users} onUpdate={handleUpdateUser} onBlock={handleBlockUser} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
