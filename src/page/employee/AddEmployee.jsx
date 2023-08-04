import { useState } from 'react';
import auth from '../../auth/auth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../utils/config';

const AddEmployee = () => {
    // auth();
    const [input, setInput] = useState({
        account: '',
        password: '',
        permission: '',
        name: '',
        salary: '',
    });
    function handleChange(e) {
        setInput({ ...input, [e.target.id]: e.target.value });
    }
    async function handleSubmit() {
        if (
            input.account == '' ||
            input.name == '' ||
            input.password == '' ||
            input.permission == '' ||
            input.salary == ''
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
        let result = await axios.post(`${API_URL}/addEmployee`, input);
        toast.error(result.data, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
        });
    }
    function handleClear() {
        setInput({ account: '', password: '', permission: '', name: '', salary: '' });
    }
    console.log(input);
    return (
        <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
            <div className="w-full mx-2 xl:w-1/3 sm:w-2/3 h-2/3 rounded-3xl border px-5 py-14 grid">
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
                    <label htmlFor="">權限 : </label>
                    <select
                        name=""
                        id="permission"
                        className="w-44 border"
                        value={input.permission}
                        onChange={(e) => handleChange(e)}
                    >
                        <option value="">請選擇</option>
                        <option value="1">會計</option>
                        <option value="2">長照</option>
                    </select>
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
                <div>
                    <label htmlFor="">時薪 : </label>
                    <input
                        type="text"
                        className="bg-white text-[#444] border"
                        id="salary"
                        value={input.salary}
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
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;
