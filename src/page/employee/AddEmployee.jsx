import React, { useState } from 'react';
import auth from '../../auth/auth';

const AddEmployee = () => {
    auth();
    const [input, setInput] = useState({
        account: '',
        password: '',
        permission: '',
        name: '',
        salary: '',
    });
  function handleChange() {
      setInput()
    }
    return (
        <div className="w-full h-[calc(100vh-48px)] flex justify-center items-center">
            <div className="w-2/3 h-2/3 rounded-3xl border px-5 py-14 grid">
                <div>
                    <label htmlFor="">帳號 : </label>
                    <input type="text" className="bg-white text-[#444] border" />
                </div>
                <div>
                    <label htmlFor="">密碼 : </label>
                    <input type="text" className="bg-white text-[#444] border" />
                </div>
                <div>
                    <label htmlFor="">權限 : </label>
                    <select name="" id="" className="w-44 border">
                        <option value="">請選擇</option>
                        <option value="1">會計</option>
                        <option value="2">長照</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="">姓名 : </label>
                    <input type="text" className="bg-white text-[#444] border" />
                </div>
                <div>
                    <label htmlFor="">時薪 : </label>
                    <input type="text" className="bg-white text-[#444] border" />
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;
