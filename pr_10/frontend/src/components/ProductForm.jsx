import React, { useEffect, useState } from 'react';

export default function ProductForm({ selectedProduct, onSubmit, onClear }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        if (!selectedProduct) {
            setFormData({
                title: '',
                category: '',
                description: '',
                price: ''
            });
            return;
        }

        setFormData({
            title: selectedProduct.title,
            category: selectedProduct.category,
            description: selectedProduct.description,
            price: String(selectedProduct.price)
        });
    }, [selectedProduct]);

    return (
        <form className="card form" onSubmit={event => {
            event.preventDefault();
            onSubmit({
                ...formData,
                price: Number(formData.price)
            });
        }}>
            <h2 className="card__title">{selectedProduct ? 'Редактирование товара' : 'Создание товара'}</h2>
            <input className="input" placeholder="Название" value={formData.title} onChange={event => setFormData({ ...formData, title: event.target.value })} />
            <input className="input" placeholder="Категория" value={formData.category} onChange={event => setFormData({ ...formData, category: event.target.value })} />
            <textarea className="input input--textarea" placeholder="Описание" value={formData.description} onChange={event => setFormData({ ...formData, description: event.target.value })} />
            <input className="input" placeholder="Цена" value={formData.price} onChange={event => setFormData({ ...formData, price: event.target.value })} />
            <div className="actions">
                <button className="btn btn--primary" type="submit">{selectedProduct ? 'Сохранить' : 'Создать'}</button>
                <button className="btn" type="button" onClick={onClear}>Очистить</button>
            </div>
        </form>
    );
}
