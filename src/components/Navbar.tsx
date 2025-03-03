import React from "react";
import "../styles/navbar.css"

interface NavbarTab {
    name: string;
    url?: string;
    onClick?: () => void;
}

interface NavbarProps {
    title: string;
    tabs: NavbarTab[];
}

const Navbar: React.FC<NavbarProps> = ({ title, tabs }) => {
    return (
        <nav className="navbar">
            <h1>{title}</h1>
            {
                tabs.map((tab, index) => {
                    return (
                        <a 
                            key={index}
                            href={tab.url || "#"} 
                            onClick={(e) => {
                                if (tab.onClick) {
                                    e.preventDefault();
                                    tab.onClick();
                                }
                            }}
                        >
                            {tab.name}
                        </a>
                    );
                })
            }
        </nav>
    )
}

export default Navbar;