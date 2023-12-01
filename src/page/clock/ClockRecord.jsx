import axios from 'axios';
import auth from '../../auth/auth';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import moment from 'moment/moment';

const ClockRecord = () => {
  auth();
  const [record, setRecord] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [searchCondition, setSearchCondition] = useState({
    begin: '',
    end: '',
    settlement_id: '',
  });
  console.log(searchCondition);
  function handleChange(e) {
    console.log(e.target.tagName);
    if (e.target.tagName.toLowerCase() == 'div') {
      setSearchCondition((prev) => ({ ...prev, [e.target.dataset.name]: e.target.dataset.value }));
    } else {
      setSearchCondition((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  }

  async function fetchRecordData() {
    try {
      let data = await axios.get(`${API_URL}/getClockRecord`);
      setRecord(data.data);
    } catch (error) {
      console.error('資料庫錯誤', error);
    }
  }

  async function fetchSettlementData() {
    try {
      let data = await axios.get(`${API_URL}/getSettlement`);
      setSettlement(data.data);
    } catch (error) {
      console.error('資料庫錯誤', error);
    }
  }

  useEffect(() => {
    fetchRecordData();
    fetchSettlementData();
  }, []);
  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center">
      <div className="w-full 2xl:w-3/4 flex flex-col gap-16">
        <div className="flex flex-col justify-center items-start gap-6">
          <div className="flex flex-col justify-center items-start gap-2">
            <div>篩選時間</div>
            <div>
              <input
                type="datetime-local"
                className="bg-white border border-black"
                name="begin"
                value={searchCondition.begin}
                onChange={(e) => handleChange(e)}
              />
              <span> ~ </span>
              <input
                type="datetime-local"
                className="bg-white border border-black"
                name="end"
                value={searchCondition.end}
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-start gap-2">
            <div>篩選結算型態</div>
            <div className="flex gap-3">
              {settlement.map((v, i) => {
                return (
                  <div
                    className={`border border-black py-2 px-4 rounded transition ${
                      searchCondition.settlement_id == v.settlement_id && ' bg-black text-white'
                    }`}
                    data-name="settlement_id"
                    key={i}
                    data-value={v.settlement_id}
                    onClick={(e) => handleChange(e)}
                  >
                    {v.settlement_name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <table className="w-full overflow-auto table-auto border border-gray-400">
          <thead className="bg-gray-200 h-10">
            <tr className="">
              <th className="px-2">個案名稱</th>
              <th className="px-2">特護名稱</th>
              <th className="px-2">上班經緯度</th>
              <th className="px-2">下班經緯度</th>
              <th className="px-4">上班時間</th>
              <th className="px-4">下班時間</th>
              <th className="px-4">薪資</th>
              <th className="px-2"></th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {record.map((v, i) => {
              const workStart = moment(v.in_time).hour();
              const workEnd = moment(v.out_time).hour();
              {
                /* console.log(workStart);
              console.log(workEnd); */
              }

              let morningShiftHours = 0;
              let afternoonShiftHours = 0;
              let nightShiftHours = 0;

              // 08:00~16:00 的情况
              if (workStart < workEnd) {
                if ((workStart < 8 && workEnd < 8) || (workStart > 16 && workEnd > 16)) {
                  morningShiftHours = 0;
                } else {
                  morningShiftHours = Math.min(workEnd, 16) - Math.max(workStart, 8);
                }
              } else if (workStart > workEnd) {
                if (workStart >= 16 && workEnd <= 8) {
                  morningShiftHours = 0;
                } else if (workEnd > 8) {
                  morningShiftHours = Math.min(workEnd, 16) - Math.min(workStart, 8);
                } else {
                  morningShiftHours = Math.max(workEnd, 16) - Math.max(workStart, 8);
                }
              }

              // 16:00~24:00 的情况
              if (workStart < workEnd) {
                if (workStart < 16 && workEnd < 16) {
                  afternoonShiftHours = 0;
                } else {
                  afternoonShiftHours = Math.min(workEnd, 24) - Math.max(workStart, 16);
                }
              } else if (workStart > workEnd) {
                if (workEnd >= 16) {
                  afternoonShiftHours = Math.min(workEnd, 24) - Math.min(workStart, 16);
                } else {
                  afternoonShiftHours = Math.max(workEnd, 24) - Math.max(workStart, 16);
                }
              }

              // 24:00~08:00 的情况
              if (workStart < workEnd) {
                if (workStart > 8 && workEnd > 8) {
                  nightShiftHours = 0;
                } else if (workStart > 8) {
                  nightShiftHours = Math.min(workEnd, 8) - Math.min(workStart, 0);
                } else {
                  nightShiftHours = Math.min(workEnd, 8) - Math.max(workStart, 0);
                }
              } else if (workStart > workEnd) {
                if (workStart > 8) {
                  nightShiftHours = Math.min(workEnd, 8) - Math.min(workStart, 0);
                } else {
                  nightShiftHours = Math.min(workEnd, 8) - Math.max(workStart, 0);
                }
              }

              {
                /* console.log(morningShiftHours);
              console.log(afternoonShiftHours);
              console.log(nightShiftHours); */
              }
              const total_wage =
                morningShiftHours * v.morning_wage +
                afternoonShiftHours * v.afternoon_wage +
                nightShiftHours * v.night_wage;
              return (
                <tr key={i} className="h-10 hover:bg-emerald-50">
                  <td className="">{v.individual_name}</td>
                  <td>{v.name}</td>
                  <td>{v.in_lat_lng}</td>
                  <td>{v.out_lat_lng}</td>
                  <td className="w-fit">{moment(v.in_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                  <td className="w-fit">{moment(v.out_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                  <td>{total_wage}</td>
                  <td>
                    <div className="bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer">編輯</div>
                  </td>
                  <td>
                    <div className="bg-red-600 text-white border px-3 py-1 w-max cursor-pointer">刪除</div>
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

export default ClockRecord;
