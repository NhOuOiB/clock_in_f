import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import { Link } from 'react-router-dom';
import moment from 'moment';

const SpecialCaseRecord = () => {
  const [special, setSpecial] = useState([]);

  async function handleDelete(id) {
    let msg = await axios.put(`${API_URL}/deleteSpecialRecord?id=${id}`);

    fetchSpecialData()
  }

  async function fetchSpecialData() {
    try {
      let data = await axios.get(`${API_URL}/getSpecialRecord`);
      setSpecial(data.data);
    } catch (error) {
      console.error('資料庫錯誤', error);
    }
  }

  useEffect(() => {
    fetchSpecialData()
  }, []);
  return (
    <div className="w-full min-h-[calc(100%-48px)] flex flex-col justify-center items-center p-20">
      <div className="2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-4/5 sm:w-12/12 flex flex-col items-end gap-2">
        <Link
          to={'/addSpecialCaseRecord'}
          className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
        >
          新增
        </Link>

        <table className=" w-full min-h-2/3 overflow-auto table-auto border border-gray-400">
          <thead className="bg-gray-200 h-10">
            <tr className="">
              <th className="px-2">特殊狀況</th>
              <th className="px-2">對象</th>
              <th className="px-2">倍數</th>
              <th className="px-2">開始時間</th>
              <th className="px-2">結束時間</th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {special.map((v, i) => {
              return (
                <tr key={i} className="h-10 hover:bg-emerald-50">
                  <td>{v.special_case_name}</td>
                  <td>{v.individual_id === null || v.individual_id === '' ? '全部':`${v.individual_id}`}</td>
                  <td>{v.multiple}</td>
                  <td>{moment(v.begin).format('YYYY年MM月DD日 HH點mm分')}</td>
                  <td>{moment(v.end).format('YYYY年MM月DD日 HH點mm分')}</td>
                  <td className="flex justify-evenly items-center">
                    <Link
                      to={`/addSpecialCaseRecord/${v.id}`}
                      className="h-full flex justify-center items-center font-bold bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer"
                    >
                      編輯
                    </Link>
                    <div
                      className="bg-red-600 text-white border px-3 py-1 w-max cursor-pointer"
                      onClick={() => handleDelete(v.id)}
                    >
                      刪除
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecialCaseRecord;
