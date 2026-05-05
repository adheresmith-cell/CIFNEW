import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUser,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import BigSearch from './BigSearch';
import Button from '../ui/Button';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(true);

  if (location.pathname === '/') {
    return <BigSearch />;
  }

  return (
    <nav className="bg-white shadow-md p-4" expl="bg-gray-800 p-4 fixed top-0 left-0 right-0 z-50 bg-red shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        <div className="flex items-center space-x-4">
          <Button
            onClick={() => { navigate('/'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />首页
          </Button>
          <Button
            onClick={() => { navigate('/articles'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 文章列表
          </Button>
          <Button
            onClick={() => { navigate('/searchtree'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 节点索引
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Button onClick={() => { navigate('/editor'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            编辑内容
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
