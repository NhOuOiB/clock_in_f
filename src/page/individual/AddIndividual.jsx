import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const AddIndividual = () => {
  const { individual_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState({
    individual_id: '',
    individual_name: '',
    settlement_id: '1',
    type_id: '1',
    morning_wage: '',
    afternoon_wage: '',
    night_wage: '',
  });
  const [type, setType] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [individual, setIndividual] = useState([]);
  function handleChange(e) {
    setInput({ ...input, [e.target.id]: e.target.value });
  }
  async function handleSubmit() {
    if (
      input.individual_id === '' ||
      input.individual_name === '' ||
      input.settlement_id === '' ||
      input.type_id === '' ||
      input.morning_wage === '' ||
      input.afternoon_wage === '' ||
      input.night_wage === ''
    ) {
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
    if (individual_id) {
      result = await axios.put(`${API_URL}/updateIndividual`, input);
    } else {
      result = await axios.post(`${API_URL}/addIndividual`, input);
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
      navigate('/individual', { state: { searchCondition: location.state?.searchCondition } });
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
    if (individual_id) {
      setInput((prev) => {
        return {
          individual_id: prev.individual_id,
          individual_name: '',
          settlement_id: '1',
          type_id: '1',
          morning_wage: '',
          afternoon_wage: '',
          night_wage: '',
        };
      });
    } else {
      setInput({
        individual_id: '',
        individual_name: '',
        settlement_id: '1',
        type_id: '1',
        morning_wage: '',
        afternoon_wage: '',
        night_wage: '',
      });
    }
  }

  function handleBack() {
    navigate('/individual', { state: { searchCondition: location.state?.searchCondition } });
  }

  useEffect(() => {
    (async () => {
      if (individual_id) {
        let data = await axios.get(`${API_URL}/getIndividualById/${individual_id}`);
        data.data.map((v, i) => {
          setInput({
            individual_id: v.individual_id.trim(),
            individual_name: v.individual_name.trim(),
            settlement_id: v.settlement_id,
            type_id: v.type_id,
            morning_wage: v.morning_wage,
            afternoon_wage: v.afternoon_wage,
            night_wage: v.night_wage,
          });
        });

        let individual_data = await axios.get(`${API_URL}/getIndividual`);
        setIndividual(individual_data.data);
      }

      let type_data = await axios.get(`${API_URL}/getType`);
      setType(type_data.data);
      let settlement_data = await axios.get(`${API_URL}/getSettlement`);
      setSettlement(settlement_data.data);
    })();
  }, []);
  return (
    <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
      <div className="w-full mx-2 2xl:w-1/3 xl:w-1/2 sm:w-2/3 h-3/4 rounded-3xl border px-14 py-8 md:px-24 lg:px-28 flex flex-col justify-center gap-4">
        <div className="flex items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">個案名稱 : </label>
            <input
              type="text"
              className="bg-white text-[#444] border"
              id="individual_name"
              value={input.individual_name}
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">個案代碼 : </label>
            <input
              type="text"
              className={`bg-white text-[#444] border ${individual_id && 'bg-[#eee] text-[#888]'}`}
              id="individual_id"
              value={input.individual_id}
              onChange={(e) => handleChange(e)}
              readOnly={!!individual_id}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">結算型態 : </label>
            <select
              name="settlement_id"
              id="settlement_id"
              value={input.settlement_id}
              className="border w-44 h-7"
              onChange={(e) => handleChange(e)}
            >
              {settlement.map((v, i) => (
                <option value={v.settlement_id} key={i} id="settlement_id">
                  {v.settlement_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">個案型態 : </label>
            <select
              name="type_id"
              id="type_id"
              className="border w-44 h-7"
              value={input.type_id}
              onChange={(e) => handleChange(e)}
            >
              {type.map((v, i) => (
                <option value={v.type_id} key={i} id="type_id">
                  {v.type_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">薪資計算時段1 : </label>
            <div className="w-44 border">08 : 00 ~ 16 : 00</div>
          </div>
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">時薪1 : </label>
            <input
              type="text"
              className="bg-white text-[#444] border"
              id="morning_wage"
              value={input.morning_wage}
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">薪資計算時段2 : </label>
            <div className="w-44 border">16 : 00 ~ 24 : 00</div>
          </div>
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">時薪2 : </label>
            <input
              type="text"
              className="bg-white text-[#444] border"
              id="afternoon_wage"
              value={input.afternoon_wage}
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">薪資計算時段3 : </label>
            <div className="w-44 border">00 : 00 ~ 08 : 00</div>
          </div>
          <div className="flex flex-col items-start w-fit gap-1">
            <label htmlFor="">時薪3 : </label>
            <input
              type="text"
              className="bg-white text-[#444] border"
              id="night_wage"
              value={input.night_wage}
              onChange={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="flex justify-center items-center gap-10 mt-10">
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

export default AddIndividual;
