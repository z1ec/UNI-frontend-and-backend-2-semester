import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        setTitle(initialProduct?.title || '');
        setCategory(initialProduct?.category || '');
        setDescription(initialProduct?.description || '');
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : '');
        setStock(initialProduct?.stock != null ? String(initialProduct.stock) : '');
    }, [open, initialProduct]);

    if (!open) {
        return null;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const preparedTitle = title.trim();
        const preparedCategory = category.trim();
        const preparedDescription = description.trim();
        const preparedPrice = Number(price);
        const preparedStock = Number(stock);

        if (!preparedTitle || !preparedCategory || !preparedDescription) {
            alert('Заполните текстовые поля');
            return;
        }

        if (!Number.isFinite(preparedPrice) || !Number.isFinite(preparedStock)) {
            alert('Введите корректные цену и остаток');
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            title: preparedTitle,
            category: preparedCategory,
            description: preparedDescription,
            price: preparedPrice,
            stock: preparedStock
        });
    }

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={event => event.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title">{mode === 'edit' ? 'Редактирование товара' : 'Создание товара'}</div>
                    <button className="btn" onClick={onClose}>Закрыть</button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <input className="input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Название" />
                    <input className="input" value={category} onChange={event => setCategory(event.target.value)} placeholder="Категория" />
                    <textarea className="input input--textarea" value={description} onChange={event => setDescription(event.target.value)} placeholder="Описание" />
                    <input className="input" value={price} onChange={event => setPrice(event.target.value)} placeholder="Цена" />
                    <input className="input" value={stock} onChange={event => setStock(event.target.value)} placeholder="Количество на складе" />
                    <div className="modal__footer">
                        <button type="submit" className="btn btn--primary">{mode === 'edit' ? 'Сохранить' : 'Создать'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
