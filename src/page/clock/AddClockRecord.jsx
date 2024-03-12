import { useState, useEffect } from 'react';
import auth from '../../auth/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

const AddClockRecord = () => {
  auth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    in_time: '',
    out_time: '',
  });
  function handleChange(e) {
    setInput({ ...input, [e.target.id]: e.target.value });
  }
  async function handleSubmit() {
    if (input.in_time == '') {
      toast.error('請至少填寫上班時間', {
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
    if (id) {
      result = await axios.put(`${API_URL}/updateClockRecord`, { id: id, ...input });
    } else {
      result = await axios.post(`${API_URL}/makeUpClockIn`, {
        id: localStorage.getItem('userId'),
        individual_id: localStorage.getItem('individualId'),
        ...input,
      });
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
      navigate('/clockRecord');
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
    setInput({ in_time: '', out_time: '' });
  }

  function handleBack() {
    navigate('/clockRecord');
  }

  useEffect(() => {
    (async () => {
      if (id) {
        let data = await axios.get(`${API_URL}/getClockRecordById/${id}`);
        data.data.map((v, i) => {
          setInput({
            in_time: moment(v.in_time).format('YYYY-MM-DDTHH:mm'),
            out_time: moment(v.out_time).format('YYYY-MM-DDTHH:mm'),
          });
        });
      }
    })();
  }, []);
  return (
    <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
      <div className="w-full mx-2 xl:w-1/3 sm:w-2/3 h-3/4 rounded-3xl border px-5 py-14 flex flex-col justify-center gap-20">
        <div>
          <label htmlFor="">上班時間 : </label>
          <input
            type="datetime-local"
            className="bg-white text-[#444] border"
            id="in_time"
            value={input.in_time}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label htmlFor="">下班時間 : </label>
          <input
            type="datetime-local"
            className="bg-white text-[#444] border"
            id="out_time"
            value={input.out_time}
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

export default AddClockRecord;
