import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import { useEffect } from "react";
import "../styles/navbar.css";

interface NavbarTab {
    name: string;
    url?: string;
    onClick?: () => void;
}

interface NavbarProps {
    title: string;
    tabs: NavbarTab[];
    // theme: "light" | "dark";  // Accept theme as prop
}

const Navbar: React.FC<NavbarProps> = ({ title, tabs }) => { // add themes when needed
    const { isAuthenticated, userRole, logout } = useAuth();
    const navigate = useNavigate();

    // Apply theme when component mounts or theme changes
    // useEffect(() => {
    //     document.body.setAttribute("data-theme", theme);
    //     localStorage.setItem("theme", theme);
    // }, [theme]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1>{title}</h1>
            </div>
            <div className="navbar-right">
                {isAuthenticated ? (
                    <>
                        <Link to="/home" className="nav-link">Home</Link>
                        <span className="user-role">{userRole === 'admin' ? 'Admin' : 'User'}</span>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    tabs.map((tab, index) => (
                        <a
                            key={index}
                            href={tab.url || "#"}
                            onClick={(e) => {
                                if (tab.onClick) {
                                    e.preventDefault();
                                    tab.onClick();
                                }
                            }}
                            className="nav-link"
                        >
                            {tab.name}
                        </a>
                    ))
                )}
            </div>
        </nav>
    )
}

export default Navbar;