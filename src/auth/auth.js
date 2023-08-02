import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/config';
import { toast } from 'react-toastify';

const UserPermission = () => {
    const navigate = useNavigate();
    useEffect(() => {
      (async () => {
        if (!localStorage.getItem('permission')) {
            navigate('/login');
          }
            try {
                let result = await axios.get(`${API_URL}/auth`, {
                    withCredentials: true,
                });
            } catch (err) {
                toast.error(err.response.data.message, {
                    position: 'top-center',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'dark',
                });
                if (err.response.status == 401) navigate('/login');
            }
        })();
    }, []);
};

export default UserPermission;
