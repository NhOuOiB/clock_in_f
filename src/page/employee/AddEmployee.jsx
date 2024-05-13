import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const AddEmployee = () => {
  const { employee_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState({
    id: '',
    account: '',
    password: '',
    name: '',
  });
  function handleChange(e) {
    setInput({ ...input, [e.target.id]: e.target.value });
  }
  async function handleSubmit() {
    if (input.account == '' || input.name == '' || input.password == '') {
      toast.error('有欄位未填寫', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
      return false;
    }
    let result;
    if (employee_id) {
      result = await axios.put(`${API_URL}/updateEmployee`, { employee_id: employee_id, ...input });
    } else {
      result = await axios.post(`${API_URL}/addEmployee`, input);
    }
    if (result.data.status) {
      toast.success(result.data.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
      navigate('/employee', { state: { searchCondition: location.state?.searchCondition } });
    } else {
      toast.error(result.data.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    }
  }
  function handleClear() {
    setInput({ id:'', account: '', password: '', name: '' });
  }

  function handleBack() {
    navigate('/employee', { state: { searchCondition: location.state?.searchCondition } });
  }

  useEffect(() => {
    (async () => {
      if (employee_id) {
        let data = await axios.get(`${API_URL}/getEmployeeById/${employee_id}`);
        data.data.map((v, i) => {
          setInput({ id: v.id, account: v.account.trim(), password: v.password.trim(), name: v.name.trim() });
        });
      }
    })();
  }, []);
  return (
    <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
      <div className="w-full mx-2 xl:w-1/3 sm:w-2/3 h-3/4 rounded-3xl border px-5 py-14 flex flex-col justify-center gap-20">
        <div>
          <label htmlFor="">帳號 : </label>
          <input
            type="text"
            className="bg-white text-[#444] border"
            id="account"
            value={input.account}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label htmlFor="">密碼 : </label>
          <input
            type="text"
            className="bg-white text-[#444] border"
            id="password"
            value={input.password}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label htmlFor="">姓名 : </label>
          <input
            type="text"
            className="bg-white text-[#444] border"
            id="name"
            value={input.name}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div className="flex justify-center items-center gap-10">
          <div className="bg-green-400 py-2 px-4 rounded cursor-pointer" onClick={handleSubmit}>
            儲存
          </div>
          <div className="bg-red-500 py-2 px-4 rounded cursor-pointer" onClick={handleClear}>
            清除
          </div>
          <div className="bg-slate-300 py-2 px-4 rounded cursor-pointer" onClick={handleBack}>
            返回
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
