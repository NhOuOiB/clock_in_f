import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [link] = useState([
        {
            link: '/clock',
            name: '打卡',
            permission: 2,
        },
        {
            link: '/clockRecord',
            name: '打卡紀錄',
            permission: 2,
        },
        {
            link: '/clockRecord',
            name: '打卡紀錄',
            permission: 1,
        },
        {
            link: '/employee',
            name: '特護',
            permission: 1,
        },
        {
            link: '/individual',
            name: '個案',
            permission: 1,
        },
        {
            link: '/specialCaseRecord',
            name: '特殊狀況',
            permission: 1,
        },
    ]);
    const permission = localStorage.getItem('permission');
    return (
        <div className="top-0 left-0 w-full h-12 bg-white border flex">
            {link.map((v, i) => {
                return (
                    permission == v.permission && (
                        <div
                            className={`w-24 sm:w-20 h-full font-bold relative hover:text-cyan-700 hover:cursor-pointer hover:bg-slate-50 ${
                                i == 0 ? 'border-x' : 'border-e'
                            }`}
                            key={i}
                        >
                            <Link to={`${v.link}`} className="w-full h-full flex justify-center items-center font-bold">
                                {v.name}
                            </Link>
                        </div>
                    )
                );
            })}
            <div></div>
        </div>
    );
};

export default Header;
