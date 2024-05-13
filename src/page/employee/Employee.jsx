import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pagination } from 'antd';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

const Employee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);
  const [searchCondition, setSearchCondition] = useState(
    location.state?.searchCondition || {
      employee_name: '',
      page: 1,
      pageSize: 10,
    }
  );
  const MySwal = withReactContent(Swal);

  const fetchEmployeeData = async () => {
    try {
      let data = await axios.get(`${API_URL}/getEmployee`, { params: searchCondition });
      setEmployee(data.data);
    } catch (error) {
      console.error('獲取員工數據發生錯誤:', error);
    }
  };

  const handleDelete = async (employee_id, employee_name, account) => {
    try {
      Swal.fire({
        title: `確定要刪除嗎?`,
        html: `特護名稱 : ${employee_name}<br>帳號 : ${account}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '刪除',
        cancelButtonText: '取消',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // 發送刪除請求
          let result = await axios.put(`${API_URL}/deleteEmployee?employee_id=${employee_id}`);
          toast.success(result.data.message, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          });
          // 刪除成功後重新獲取最新的資料
          fetchEmployeeData();
        }
      });
    } catch (error) {
      console.error('刪除員工發生錯誤:', error);
    }
  };

  function handleChange(e) {
    if (e.target.tagName.toLowerCase() == 'div') {
      setSearchCondition((prev) => ({ ...prev, [e.target.dataset.name]: e.target.dataset.value, page: 1 }));
    } else {
      setSearchCondition((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    }
  }

  function handleToAddEmployee(employee_id) {
    navigate(`/addEmployee/${employee_id}`, { state: { searchCondition: searchCondition } });
  }

  useEffect(() => {
    // 初始加載員工數據
    fetchEmployeeData();
  }, [searchCondition]);

  useEffect(() => {
    // 重新整理清除location.state
    if (location.state) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="w-full min-h-[calc(100%-48px)] flex flex-col justify-center items-center py-20">
      <div className="w-full h-fit flex flex-col justify-center items-center">
        <div className="2xl:w-1/3 xl:w-1/3 lg:w-1/2 md:w-1/2 sm:w-2/3 w-full flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <div>特護名稱</div>
            <div>
              <input
                className="bg-white border border-[#444]"
                name="employee_name"
                type="text"
                value={searchCondition.employee_name}
                onInput={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to={'/addEmployee'}
              className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
            >
              新增
            </Link>
          </div>

          <table className=" w-full min-h-2/3 overflow-auto table-auto border border-gray-400">
            <thead className="bg-gray-200 h-10">
              <tr className="">
                <th className="px-2">特護名稱</th>
                <th className="px-2">帳號</th>
                <th className="px-2">密碼</th>
                <th className="px-2"></th>
              </tr>
            </thead>
            <tbody>
              {employee?.data?.length > 0 &&
                employee.data.map((v, i) => {
                  return (
                    <tr key={i} className="h-10 hover:bg-emerald-50">
                      <td>{v.name}</td>
                      <td>{v.account}</td>
                      <td>{v.password}</td>
                      <td className="flex justify-evenly items-center">
                        <div
                          onClick={() => handleToAddEmployee(v.employee_id)}
                          className="h-full flex justify-center items-center font-bold bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer"
                        >
                          編輯
                        </div>
                        <div
                          className="bg-red-600 text-white border px-3 py-1 w-max cursor-pointer"
                          onClick={() => handleDelete(v.employee_id, v.name, v.account)}
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
            total={employee.count}
            current={searchCondition.page}
            onChange={(page, pageSize) => {
              setSearchCondition((prev) => ({ ...prev, ['page']: page, ['pageSize']: pageSize }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Employee;
