import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import { Link } from 'react-router-dom';

const IndividualCase = () => {
  const [individual, setIndividual] = useState([]);

  async function handleDelete(individual_id) {
    let msg = await axios.put(`${API_URL}/deleteIndividual?individual_id=${individual_id}`);

    fetchIndividualData();
  }

  async function fetchIndividualData() {
    try {
      let data = await axios.get(`${API_URL}/getIndividual`);
      setIndividual(data.data);
    } catch (error) {
      console.error('Error loading individual data:', error);
    }
  }
  useEffect(() => {
    fetchIndividualData()
  }, []);
  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center">
      <div className="2xl:w-1/3 xl:w-1/3 lg:w-1/2 md:w-1/2 sm:w-2/3 flex flex-col items-end gap-2">
        <Link
          to={'/addIndividual'}
          className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
        >
          新增
        </Link>

        <table className=" w-full min-h-2/3 overflow-auto table-auto border border-gray-400">
          <thead className="bg-gray-200 h-10">
            <tr className="">
              <th className="px-2">個案名稱</th>
              <th className="px-2">個案代碼</th>
              <th className="px-2">個案型態</th>
              <th className="px-2">結算型態</th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {individual.map((v, i) => {
              return (
                <tr key={i} className="h-10 hover:bg-emerald-50">
                  <td>{v.individual_name}</td>
                  <td>{v.individual_id}</td>
                  <td>{v.type_name}</td>
                  <td>{v.settlement_name}</td>
                  <td className="flex justify-evenly items-center">
                    <Link
                      to={`/addIndividual/${v.individual_id}`}
                      className="h-full flex justify-center items-center font-bold bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer"
                    >
                      編輯
                    </Link>
                    <div
                      className="bg-red-600 text-white border px-3 py-1 w-max cursor-pointer"
                      onClick={() => handleDelete(v.individual_id)}
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

export default IndividualCase;
