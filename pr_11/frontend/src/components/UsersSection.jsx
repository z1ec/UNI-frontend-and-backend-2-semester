import React from 'react';

export default function UsersSection({ users, onUpdate, onBlock }) {
    return (
        <div className="card">
            <h2 className="card__title">Пользователи</h2>
            <div className="list">
                {users.map(user => (
                    <div className="row" key={user.id}>
                        <div>
                            <div className="row__title">{user.first_name} {user.last_name}</div>
                            <div className="row__text">{user.email}</div>
                            <div className="row__text">Роль: {user.role}{user.blocked ? ' • заблокирован' : ''}</div>
                        </div>
                        <div className="actions">
                            <button className="btn" onClick={() => onUpdate(user.id, user)}>Повысить до admin</button>
                            <button className="btn btn--danger" onClick={() => onBlock(user.id)}>Заблокировать</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
