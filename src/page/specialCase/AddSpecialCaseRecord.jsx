import { useState, useEffect } from 'react';
import auth from '../../auth/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

const AddSpecialCaseRecord = () => {
  // auth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    special_case_id: '1',
    individual_id: '',
    multiple:'2',
    begin: '',
    end: '',
  });
  const [special, setSpecial] = useState([])
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'special_case_id') {
      // 在這裡檢查特殊狀況的薪資倍數，並更新薪資倍數的輸入值
      const selectedSpecialCase = special.find((v) => v.special_case_id == value);
      const newMultipleValue = selectedSpecialCase ? selectedSpecialCase.multiple : '';

      setInput((prevInput) => ({
        ...prevInput,
        special_case_id: value,
        multiple: newMultipleValue,
      }));
    } else {
      setInput((prevInput) => ({
        ...prevInput,
        [name]: value,
      }));
    }
  }
  async function handleSubmit() {
    if (input.special_case_id == '' || input.begin == '' || input.end == '') {
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
    if (id) {
      result = await axios.put(`${API_URL}/updateSpecialRecord`, { id: id, ...input });
    } else {
      result = await axios.post(`${API_URL}/addSpecialRecord`, input);
    }
    if (result.status == 200) {
      toast.success(result.data.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
      navigate('/specialCaseRecord');
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
    setInput({ special_case_id: '1', individual_id: '', multiple: '', begin: '', end: '' });
  }

  function handleBack() {
    navigate('/specialCaseRecord');
  }

  useEffect(() => {
    (async () => {
      if (id) {
        let data = await axios.get(`${API_URL}/getSpecialRecordById/${id}`);
        data.data.map((v, i) => {
          setInput({
            special_case_id: v.special_case_id,
            individual_id: v.individual_id,
            multiple: v.multiple,
            begin: moment(v.begin).format('YYYY-MM-DDTHH:mm'),
            end: moment(v.end).format('YYYY-MM-DDTHH:mm'),
          });
        });
      }
      let specail_case = await axios.get(`${API_URL}/getSpecialCase`)
      setSpecial(specail_case.data)
    })();
  }, []);
  return (
    <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
      <div className="w-full mx-2 2xl:w-1/3 xl:w-1/2 sm:w-2/3 h-3/4 rounded-3xl border px-5 py-14 flex flex-col justify-center gap-20">
        <div>
          <label htmlFor="special_case_id">特殊狀況 : </label>
          <select
            name="special_case_id"
            id="special_case_id"
            value={input.special_case_id}
            className="border w-44 h-7"
            onChange={(e) => handleChange(e)}
          >
            {special.map((v, i) => (
              <option value={v.special_case_id} key={i} id="special_case_id">
                {v.special_case_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center">
          <label htmlFor="individual_id">個案代號 : </label>
          <input
            type="text"
            className="bg-white text-[#444] border ms-1"
            id="individual_id"
            name="individual_id"
            value={input.individual_id}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div className="flex justify-center">
          <label htmlFor="">薪資倍數 : </label>
          <div className="w-44 h-7 border bg-[#eee] text-[#888] ms-1 text-left px-1">{input.multiple}</div>
        </div>
        <div>
          <label htmlFor="begin">開始時間 : </label>
          <input
            type="datetime-local"
            className="bg-white text-[#444] border"
            id="begin"
            name="begin"
            value={input.begin}
            onChange={(e) => handleChange(e)}
          />
        </div>
        <div>
          <label htmlFor="end">結束時間 : </label>
          <input
            type="datetime-local"
            className="bg-white text-[#444] border"
            id="end"
            name="end"
            value={input.end}
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

export default AddSpecialCaseRecord;
