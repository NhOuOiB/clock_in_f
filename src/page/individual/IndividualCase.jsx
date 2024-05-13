import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

const IndividualCase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [individual, setIndividual] = useState([]);
  const [searchCondition, setSearchCondition] = useState(
    location.state?.searchCondition || {
      individual_name: '',
      page: 1,
      pageSize: 10,
    }
  );
  const MySwal = withReactContent(Swal);

  async function handleDelete(individual_id, individual_name, type_name, settlement_name) {
    try {
      Swal.fire({
        title: `確定要刪除嗎?`,
        html: `個案名稱 : ${individual_name}<br>個案代碼 : ${individual_id}<br>個案型態 : ${type_name}<br>結算型態 : ${settlement_name}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // 發送刪除請求
          let result = await axios.put(`${API_URL}/deleteIndividual?individual_id=${individual_id}`);
          toast.success(result.data.message, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          });
          // 刪除成功後重新獲取最新的打卡紀錄
          fetchIndividualData();
        }
      });
    } catch (error) {
      console.error('刪除個案發生錯誤:', error);
    }
  }

  async function fetchIndividualData() {
    try {
      let data = await axios.get(`${API_URL}/getIndividual`, { params: searchCondition });
      setIndividual(data.data);
    } catch (error) {
      console.error('Error loading individual data:', error);
    }
  }

  function handleChange(e) {
    if (e.target.tagName.toLowerCase() == 'div') {
      setSearchCondition((prev) => ({ ...prev, [e.target.dataset.name]: e.target.dataset.value, page: 1 }));
    } else {
      setSearchCondition((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    }
  }

  function handleToAddIndividualCase(individual_id) {
    navigate(`/addIndividual/${individual_id}`, { state: { searchCondition: searchCondition } });
  }

  useEffect(() => {
    fetchIndividualData();
  }, [searchCondition]);

  useEffect(() => {
    // 重新整理清除location.state
    if (location.state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  return (
    <div className="w-full min-h-[calc(100%-48px)] flex flex-col justify-center items-center py-20">
      <div className="2xl:w-1/3 xl:w-1/3 lg:w-1/2 md:w-1/2 sm:w-2/3 flex flex-col gap-4">
        <div className="flex flex-col items-start">
          <div>個案名稱</div>
          <div>
            <input
              className="bg-white border border-[#444]"
              name="individual_name"
              type="text"
              value={searchCondition.individual_name}
              onInput={(e) => handleChange(e)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Link
            to={'/addIndividual'}
            className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
          >
            新增
          </Link>
        </div>

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
            {individual?.data?.map((v, i) => {
              return (
                <tr key={i} className="h-10 hover:bg-emerald-50">
                  <td>{v.individual_name}</td>
                  <td>{v.individual_id}</td>
                  <td>{v.type_name}</td>
                  <td>{v.settlement_name}</td>
                  <td className="flex justify-evenly items-center">
                    <div
                      onClick={() => handleToAddIndividualCase(v.individual_id)}
                      className="h-full flex justify-center items-center font-bold bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer"
                    >
                      編輯
                    </div>
                    <div
                      className="bg-red-600 text-white border px-3 py-1 w-max cursor-pointer"
                      onClick={() => handleDelete(v.individual_id, v.individual_name, v.type_name, v.settlement_name)}
                    >
                      刪除
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination
          defaultCurrent={1}
          total={individual.count}
          current={searchCondition.page}
          onChange={(page, pageSize) => {
            setSearchCondition((prev) => ({ ...prev, ['page']: page, ['pageSize']: pageSize }));
          }}
        />
      </div>
    </div>
  );
};

export default IndividualCase;
