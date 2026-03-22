import React from 'react';

export default function ProductsSection({ products, detail, canDelete, onSelect, onDelete }) {
    return (
        <div className="card">
            <h2 className="card__title">Товары</h2>
            <div className="list">
                {products.map(product => (
                    <div className="row" key={product.id}>
                        <div>
                            <div className="row__title">{product.title}</div>
                            <div className="row__text">{product.category} • {product.price} ₽</div>
                        </div>
                        <div className="actions">
                            <button className="btn" onClick={() => onSelect(product.id)}>Открыть</button>
                            {canDelete && <button className="btn btn--danger" onClick={() => onDelete(product.id)}>Удалить</button>}
                        </div>
                    </div>
                ))}
            </div>
            {detail && (
                <div className="detail">
                    <div className="row__title">{detail.title}</div>
                    <div className="row__text">{detail.category}</div>
                    <div className="row__text">{detail.description}</div>
                    <div className="row__text">{detail.price} ₽</div>
                </div>
            )}
        </div>
    );
}
