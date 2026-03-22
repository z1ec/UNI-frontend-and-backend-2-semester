import React from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productTitle">{product.title}</div>
                <div className="productMeta">{product.category}</div>
                <div className="productDescription">{product.description}</div>
            </div>
            <div className="productSide">
                <div className="productPrice">{product.price} ₽</div>
                <div className="productStock">На складе: {product.stock}</div>
                <div className="productActions">
                    <button className="btn" onClick={() => onEdit(product)}>Редактировать</button>
                    <button className="btn btn--danger" onClick={() => onDelete(product.id)}>Удалить</button>
                </div>
            </div>
        </div>
    );
}
