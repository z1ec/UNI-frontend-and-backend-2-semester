import React, { useState } from 'react';

export default function AuthForm({ onRegister, onLogin }) {
    const [registerData, setRegisterData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'user'
    });
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    return (
        <div className="authGrid">
            <form className="card form" onSubmit={event => {
                event.preventDefault();
                onRegister(registerData);
            }}>
                <h2 className="card__title">Регистрация</h2>
                <input className="input" placeholder="Email" value={registerData.email} onChange={event => setRegisterData({ ...registerData, email: event.target.value })} />
                <input className="input" placeholder="Имя" value={registerData.first_name} onChange={event => setRegisterData({ ...registerData, first_name: event.target.value })} />
                <input className="input" placeholder="Фамилия" value={registerData.last_name} onChange={event => setRegisterData({ ...registerData, last_name: event.target.value })} />
                <input className="input" placeholder="Пароль" type="password" value={registerData.password} onChange={event => setRegisterData({ ...registerData, password: event.target.value })} />
                <select className="input" value={registerData.role} onChange={event => setRegisterData({ ...registerData, role: event.target.value })}>
                    <option value="user">Пользователь</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                </select>
                <button className="btn btn--primary" type="submit">Зарегистрироваться</button>
            </form>
            <form className="card form" onSubmit={event => {
                event.preventDefault();
                onLogin(loginData);
            }}>
                <h2 className="card__title">Вход</h2>
                <input className="input" placeholder="Email" value={loginData.email} onChange={event => setLoginData({ ...loginData, email: event.target.value })} />
                <input className="input" placeholder="Пароль" type="password" value={loginData.password} onChange={event => setLoginData({ ...loginData, password: event.target.value })} />
                <button className="btn btn--primary" type="submit">Войти</button>
            </form>
        </div>
    );
}
