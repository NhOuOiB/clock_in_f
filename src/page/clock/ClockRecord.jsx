import axios from 'axios';
import auth from '../../auth/auth';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import moment from 'moment/moment';

const ClockRecord = () => {
  auth();
  const [record, setRecord] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [specialCaseRecord, setSpecialCaseRecord] = useState([]);
  const [searchCondition, setSearchCondition] = useState({
    begin: '',
    end: '',
    settlement_id: '',
  });
  console.log(searchCondition);
  function handleChange(e) {
    if (e.target.tagName.toLowerCase() == 'div') {
      setSearchCondition((prev) => ({ ...prev, [e.target.dataset.name]: e.target.dataset.value }));
    } else {
      setSearchCondition((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  }

  async function fetchRecordData(searchCondition) {
    let data;
    try {
      data = await axios.get(`${API_URL}/getClockRecord`, { params: searchCondition });
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

  async function fetchSpecialCaseRecordData(searchCondition) {
    try {
      let data = await axios.get(`${API_URL}/getSpecialCaseRecord`, { params: searchCondition });
      setSpecialCaseRecord(data.data);
    } catch (error) {
      console.error('資料庫錯誤', error);
    }
  }

  async function handleDelete(id) {
    try {
      // 發送刪除請求
      await axios.put(`${API_URL}/deleteClockRecord?id=${id}`);

      // 刪除成功後重新獲取最新的打卡紀錄
      fetchRecordData(searchCondition);
    } catch (error) {
      console.error('刪除員工發生錯誤:', error);
    }
  }

  useEffect(() => {
    fetchRecordData();
    fetchSettlementData();
  }, []);

  useEffect(() => {
    fetchRecordData(searchCondition);
    fetchSpecialCaseRecordData(searchCondition);
  }, [searchCondition]);
  console.log(specialCaseRecord);
  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center">
      <div className="w-full 2xl:w-3/4 flex flex-col md:gap-16">
        <div className="flex flex-col justify-center items-start md:gap-6">
          <div className="flex flex-col justify-center items-start md:gap-2">
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
          <div className="flex flex-col justify-center items-start md:gap-2">
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

              class ShiftHourCalculator {
                constructor(workStart, workEnd) {
                  this.workStart = workStart;
                  this.workEnd = workEnd;
                  this.morningShiftHours = 0;
                  this.afternoonShiftHours = 0;
                  this.nightShiftHours = 0;
                }

                calculate() {
                  // 08:00~16:00 的情况
                  if (this.workStart < this.workEnd) {
                    if ((this.workStart < 8 && this.workEnd < 8) || (this.workStart > 16 && this.workEnd > 16)) {
                      this.morningShiftHours = 0;
                    } else {
                      this.morningShiftHours = Math.min(this.workEnd, 16) - Math.max(this.workStart, 8);
                    }
                  } else if (this.workStart > this.workEnd) {
                    if (this.workStart >= 16 && this.workEnd <= 8) {
                      this.morningShiftHours = 0;
                    } else if (this.workEnd > 8) {
                      this.morningShiftHours = Math.min(this.workEnd, 16) - Math.min(this.workStart, 8);
                    } else {
                      this.morningShiftHours = Math.max(this.workEnd, 16) - Math.max(this.workStart, 8);
                    }
                  }

                  // 16:00~24:00 的情况
                  if (this.workStart < this.workEnd) {
                    if (this.workStart < 16 && this.workEnd < 16) {
                      this.afternoonShiftHours = 0;
                    } else {
                      this.afternoonShiftHours = Math.min(this.workEnd, 24) - Math.max(this.workStart, 16);
                    }
                  } else if (this.workStart > this.workEnd) {
                    if (this.workEnd >= 16) {
                      this.afternoonShiftHours = Math.min(this.workEnd, 24) - Math.min(this.workStart, 16);
                    } else {
                      this.afternoonShiftHours = Math.max(this.workEnd, 24) - Math.max(this.workStart, 16);
                    }
                  }

                  // 24:00~08:00 的情况
                  if (this.workStart < this.workEnd) {
                    if (this.workStart > 8 && this.workEnd > 8) {
                      this.nightShiftHours = 0;
                    } else if (this.workStart > 8) {
                      this.nightShiftHours = Math.min(this.workEnd, 8) - Math.min(this.workStart, 0);
                    } else {
                      this.nightShiftHours = Math.min(this.workEnd, 8) - Math.max(this.workStart, 0);
                    }
                  } else if (this.workStart > this.workEnd) {
                    if (this.workStart > 8) {
                      this.nightShiftHours = Math.min(this.workEnd, 8) - Math.min(this.workStart, 0);
                    } else {
                      this.nightShiftHours = Math.min(this.workEnd, 8) - Math.max(this.workStart, 0);
                    }
                  }
                }
              }

              const basicWage = new ShiftHourCalculator(workStart, workEnd);
              {
                /* const totalWage =
                morningShiftHours * v.morning_wage +
                afternoonShiftHours * v.afternoon_wage +
                nightShiftHours * v.night_wage; */
              }

              let specialBonus = 0;
              let basicMorningWage = basicWage.morningShiftHours * v.morning_wage;
              let basicAfternoonWage = basicWage.afternoonShiftHours * v.afternoon_wage;
              let basicNightWage = basicWage.nightShiftHours * v.night_wage;
              let repetitionOfSpecialRecord = [];

              for (const scr of specialCaseRecord) {
                if (
                  (scr.begin < v.in_time && scr.end > v.in_time) ||
                  (scr.begin < v.out_time && scr.end > v.out_time) ||
                  (scr.begin < v.in_time && scr.end > v.out_time)
                ) {
                  {
                    /* console.log(scr.begin < v.in_time && scr.end < v.out_time);
                  console.log(scr.begin > v.in_time && scr.end > v.out_time);
                  console.log(scr.begin < v.in_time && scr.end > v.out_time); */
                  }
                  console.log(moment.max(moment(scr.begin), moment(v.in_time)).format('YYYY年MM月DD日 HH點mm分'));
                  console.log(moment.min(moment(scr.end), moment(v.out_time)).format('YYYY年MM月DD日 HH點mm分'));
                  let OverlapOfWorkHoursWithSpecialCase = new ShiftHourCalculator(
                    moment.max(moment(scr.begin), moment(v.in_time)).hour(),
                    moment.min(moment(scr.end), moment(v.out_time)).hour()
                  );
                  OverlapOfWorkHoursWithSpecialCase.calculate();
                  repetitionOfSpecialRecord.push({
                    id: repetitionOfSpecialRecord.length + 1,
                    begin: moment.max(moment(scr.begin), moment(v.in_time)),
                    end: moment.min(moment(scr.end), moment(v.out_time)),
                    morningShiftHours: OverlapOfWorkHoursWithSpecialCase.morningShiftHours,
                    afternoonShiftHours: OverlapOfWorkHoursWithSpecialCase.afternoonShiftHours,
                    nightShiftHours: OverlapOfWorkHoursWithSpecialCase.nightShiftHours,
                    multiple: scr.multiple,
                  });
                }
              }
              console.log(repetitionOfSpecialRecord);
              if (repetitionOfSpecialRecord.length > 1) {
                for (let i = 0; i < repetitionOfSpecialRecord.length - 1; i++) {
                  let currentRecord = repetitionOfSpecialRecord[i];
                  let nextRecord = repetitionOfSpecialRecord[i + 1];

                  let repetition = new ShiftHourCalculator(
                    moment.max(currentRecord.begin, nextRecord.begin).hour(),
                    moment.min(currentRecord.end, nextRecord.end).hour()
                  );
                  repetition.calculate();

                  ['morningShiftHours', 'afternoonShiftHours', 'nightShiftHours'].forEach((shiftType) => {
                    currentRecord[shiftType] -= repetition[shiftType];
                    nextRecord[shiftType] -= repetition[shiftType];

                    currentRecord[`repetitionOf${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}`] =
                      repetition[shiftType];
                    nextRecord[`repetitionOf${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}`] =
                      repetition[shiftType];
                  });
                }
              }

              

              return (
                <tr key={i} className="h-10 hover:bg-emerald-50">
                  <td className="">{v.individual_name}</td>
                  <td>{v.name}</td>
                  <td>{v.in_lat_lng}</td>
                  <td>{v.out_lat_lng}</td>
                  <td className="w-fit">{moment(v.in_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                  <td className="w-fit">{moment(v.out_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                  {/* <td>{totalWage}</td> */}
                  <td>
                    <div className="bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer">編輯</div>
                  </td>
                  <td>
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

export default ClockRecord;
