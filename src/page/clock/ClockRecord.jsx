import axios from 'axios';
import auth from '../../auth/auth';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import moment from 'moment/moment';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

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
  let recordToExcelFormat = [];

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

  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtention = '.xlsx';
  const exportToExcel = async () => {
    const modifiedRecord = recordToExcelFormat.map((array) => {
      let individual_fee = 0;
      array.forEach((v) => {
        individual_fee += v.wage;
        console.log(v);
      });

      console.log(array);

      // 在每個陣列的最後添加一個新的物件
      return [
        ...array,
        {
          date: '總和',
          time: '',
          employee_name: '',
          wage: individual_fee,
        },
        {
          date: '',
          time: '',
          employee_name: '',
          wage: '',
        },
        {
          date: '',
          time: '',
          employee_name: '',
          wage: '',
        },
        {
          date: '特護',
          time: '薪資',
          employee_name: '費用',
          wage: '總計',
        },
      ];
    });

    for (let i = 0; i < recordToExcelFormat.length; i++) {
      let employeeWage = [];
      for (let j = 0; j < recordToExcelFormat[i].length; j++) {
        let currentEmployee = recordToExcelFormat[i][j];

        let matchingEmployee = employeeWage.find((e) => e.employee_name === currentEmployee.employee_name);

        if (matchingEmployee) {
          matchingEmployee.date += currentEmployee.wage;
          matchingEmployee.employee_name += currentEmployee.wage;
        } else {
          employeeWage.push({
            date: currentEmployee.employee_name,
            time: currentEmployee.wage,
            employee_name: '',
            wage: currentEmployee.wage,
          });
        }
      }
      console.log('employeeWage', employeeWage);
      console.log('modifiedRecord[i]', modifiedRecord[i]);
      modifiedRecord[i] = modifiedRecord[i].concat(employeeWage);
    }

    modifiedRecord.map((file) => {
      console.log('file', file);
      let removeIndividual = file.map(({ individual_id, ...rest }) => rest);
      const merge = [];

      for (let i = 0; i < file.length - 1; i++) {
        const currentDate = file[i].date;
        const nextDate = file[i + 1].date;
        if (currentDate === '總和') {
          break;
        }
        if (currentDate != nextDate) {
          // 如果還沒有追蹤過這個 date，則初始化起始行數
          merge.push({ s: { r: i + 1, c: 0 }, e: { r: i + 1, c: 0 } });
        } else {
          // 如果已經追蹤過這個 date，則更新結束行數
          merge[merge.length - 1].e.r = i + 1;
        }
      }

      console.log(merge);
      const header = ['date', 'time', 'employee_name', 'wage'];
      const headerDisplay = { date: '日期', time: '時間', employee_name: '簽到人', wage: '金額' };
      const correctHeader = [headerDisplay, ...removeIndividual];
      const ws = XLSX.utils.json_to_sheet(correctHeader, { header: header, skipHeader: true });
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      // const merge = [{ s: { r: 1, c: 0 }, e: { r: 3, c: 0 } }];
      // ws['!merges'] = merge;
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      const fileName = `${
        searchCondition.begin != '' && searchCondition.end != ''
          ? searchCondition.begin + '-' + searchCondition.end + file[0].individual_id + fileExtention
          : file[0].individual_id + fileExtention
      }`;
      FileSaver.saveAs(data, fileName);
    });
  };

  useEffect(() => {
    fetchSettlementData();
  }, []);

  useEffect(() => {
    fetchRecordData(searchCondition);
    fetchSpecialCaseRecordData(searchCondition);
  }, [searchCondition]);

  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center">
      <div className="w-full 2xl:w-3/4 flex flex-col">
        <div className="flex flex-col justify-center items-start md:gap-6 md:mb-16">
          <div className="w-full flex justify-between items-start">
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
            <div className="px-2 py-2 bg-sky-600 text-white cursor-pointer" onClick={exportToExcel}>
              Excel匯出
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
        <div className="flex flex-col items-end gap-2">
          <Link
            to={'/addClockRecord'}
            className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
          >
            新增
          </Link>
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
                class ShiftHourCalculator {
                  constructor(workStart, workEnd) {
                    this.workStart = workStart;
                    this.workEnd = workEnd;
                    this.morningShiftHours = 0;
                    this.afternoonShiftHours = 0;
                    this.nightShiftHours = 0;
                    this.totalHour = 0;
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
                    this.totalHour = this.morningShiftHours + this.afternoonShiftHours + this.nightShiftHours;
                  }
                }

                const findPrevious = record.find(({ out_time }) => {
                  return moment(out_time).format('YYYYMMDDHH') === moment(v.in_time).format('YYYYMMDDHH');
                });
                const workStart = moment(v.in_time).hour();
                let workEnd = moment(v.out_time).hour();

                const totalHour = new ShiftHourCalculator(workStart, workEnd);
                totalHour.calculate();

                let supplement = 0;
                if (findPrevious === undefined) {
                  if (v.type_name === '一般') {
                    console.log(totalHour.totalHour, 'totalhour.totalHour');
                    if (totalHour.totalHour < 8) {
                      supplement = 8 - totalHour.totalHour;
                    }
                  } else if (v.type_name === '洗腎') {
                    if (totalHour.totalHour < 4) {
                      supplement = 4 - totalHour.totalHour;
                    }
                  } else if (v.type_name === '陪診') {
                    if (totalHour.totalHour < 6) {
                      supplement = 6 - totalHour.totalHour;
                    }
                  }
                }
                let compensation = moment(v.out_time).add(supplement, 'hours');
                workEnd = compensation.hour();

                const basicWage = new ShiftHourCalculator(workStart, workEnd);
                basicWage.calculate();

                {
                  /* console.log(basicWage.morningShiftHours, 'basicWage.morningShiftHours');
              console.log(basicWage.afternoonShiftHours, 'basicWage.afternoonShiftHours');
              console.log(basicWage.nightShiftHours, 'basicWage.nightShiftHours'); */
                }
                let basicMorningWage;
                let basicAfternoonWage;
                let basicNightWage;
                if (findPrevious === undefined && totalHour.totalHour < 8) {
                  basicMorningWage =
                    basicWage.morningShiftHours * Math.min(v.morning_wage, v.afternoon_wage, v.night_wage);
                  basicAfternoonWage =
                    basicWage.afternoonShiftHours * Math.min(v.morning_wage, v.afternoon_wage, v.night_wage);
                  basicNightWage = basicWage.nightShiftHours * Math.min(v.morning_wage, v.afternoon_wage, v.night_wage);
                } else {
                  basicMorningWage = basicWage.morningShiftHours * v.morning_wage;
                  basicAfternoonWage = basicWage.afternoonShiftHours * v.afternoon_wage;
                  basicNightWage = basicWage.nightShiftHours * v.night_wage;
                }
                let morningBonus = 0;
                let afternoonBonus = 0;
                let nightBonus = 0;
                let overlapOfBaseValueForMorningSpecial = [];
                let overlapOfBaseValueForAfternoonSpecial = [];
                let overlapOfBaseValueForNightSpecial = [];
                let repetitionOfSpecialRecord = [];

                for (const scr of specialCaseRecord) {
                  if (
                    (scr.begin < v.in_time && scr.end > v.in_time && scr.end < v.out_time) ||
                    (scr.begin < v.out_time && scr.begin > v.in_time && scr.end > v.out_time) ||
                    (scr.begin < v.in_time &&
                      scr.end > v.out_time )
                  ) {
                    let begin = moment.max(moment(scr.begin), moment(v.in_time));
                    let end = moment.min(moment(scr.end), compensation);
                    {/* console.log(v.individual_id, 'v');
                    console.log(scr.individual_id, 'scr');
                    console.log(scr.individual_id == v.individual_id, 'scr == v');
                    console.log(scr.individual_id == '', 'scr == ""'); */}

                    {
                      /* 
                    console.log(scr.begin < v.in_time && scr.end > v.in_time && scr.end < v.out_time);
                    console.log(scr.begin < v.out_time && scr.begin > v.in_time && scr.end > v.out_time);
                    console.log(scr.begin < v.in_time && scr.end > v.out_time);
                    console.log(moment(scr.in_time).format(''));
                    console.log(moment(scr.out_time).format(''));

                    console.log(end.hour(), 'end.hour()');
                    console.log(workEnd, 'workEnd'); */
                    }

                    let OverlapOfWorkHoursWithSpecialCase = new ShiftHourCalculator(begin.hour(), end.hour());
                    OverlapOfWorkHoursWithSpecialCase.calculate();
                    if (scr.individual_id == '' || scr.individual_id == v.individual_id) {
                      
                    repetitionOfSpecialRecord.push({
                      begin: begin,
                      end: end,
                      morningShiftHours: OverlapOfWorkHoursWithSpecialCase.morningShiftHours,
                      afternoonShiftHours: OverlapOfWorkHoursWithSpecialCase.afternoonShiftHours,
                      nightShiftHours: OverlapOfWorkHoursWithSpecialCase.nightShiftHours,
                      multiple: scr.multiple,
                    });
                    }
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
                      currentRecord[`repetitionOf${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}`] =
                        repetition[shiftType];
                      nextRecord[`repetitionOf${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}`] =
                        repetition[shiftType];
                    });
                  }
                }

                for (let i = 0; i < repetitionOfSpecialRecord.length; i++) {
                  let baseValueForMorningSpecial;
                  let baseValueForAfternoonSpecial;
                  let baseValueForNightSpecial;
                  if (findPrevious === undefined && totalHour.totalHour < 8) {
                    baseValueForMorningSpecial = calculateBaseValue(
                      Math.min(v.morning_wage, v.afternoon_wage, v.night_wage),
                      overlapOfBaseValueForMorningSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                    baseValueForAfternoonSpecial = calculateBaseValue(
                      Math.min(v.morning_wage, v.afternoon_wage, v.night_wage),
                      overlapOfBaseValueForAfternoonSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                    baseValueForNightSpecial = calculateBaseValue(
                      Math.min(v.morning_wage, v.afternoon_wage, v.night_wage),
                      overlapOfBaseValueForNightSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                  } else {
                    baseValueForMorningSpecial = calculateBaseValue(
                      v.morning_wage,
                      overlapOfBaseValueForMorningSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                    baseValueForAfternoonSpecial = calculateBaseValue(
                      v.afternoon_wage,
                      overlapOfBaseValueForAfternoonSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                    baseValueForNightSpecial = calculateBaseValue(
                      v.night_wage,
                      overlapOfBaseValueForNightSpecial,
                      repetitionOfSpecialRecord[i].multiple
                    );
                  }
                  {/* console.log(baseValueForMorningSpecial);
                  console.log(baseValueForAfternoonSpecial);
                  console.log(baseValueForNightSpecial); */}

                  overlapOfBaseValueForMorningSpecial.push(baseValueForMorningSpecial);
                  overlapOfBaseValueForAfternoonSpecial.push(baseValueForAfternoonSpecial);
                  overlapOfBaseValueForNightSpecial.push(baseValueForNightSpecial);
                }

                console.log(overlapOfBaseValueForMorningSpecial)
                console.log(overlapOfBaseValueForAfternoonSpecial)
                console.log(overlapOfBaseValueForNightSpecial)

                function calculateBaseValue(baseWage, overlapArray, multiple) {
                  let totalOverlap = overlapArray.reduce((acc, val) => acc + val, 0);
                  return (baseWage + totalOverlap) * (multiple - 1);
                }

                {
                  /* console.log(repetitionOfSpecialRecord); */
                }
                for (let i = 0; i < repetitionOfSpecialRecord.length; i++) {
                  if (repetitionOfSpecialRecord.length === 1) {
                    morningBonus +=
                      repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0];
                    afternoonBonus +=
                      repetitionOfSpecialRecord[i].afternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[0];
                    nightBonus += repetitionOfSpecialRecord[i].nightShiftHours * overlapOfBaseValueForNightSpecial[0];
                  } else if (repetitionOfSpecialRecord.length > 1) {
                    if (i === 0) {
                      morningBonus +=
                        repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0];
                      afternoonBonus +=
                        repetitionOfSpecialRecord[i].afternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[0];
                      nightBonus += repetitionOfSpecialRecord[i].nightShiftHours * overlapOfBaseValueForNightSpecial[0];
                      {
                        /* console.log(
                      repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0]
                    ); */
                      }
                    } else if (i === 1) {
                      if (
                        repetitionOfSpecialRecord[i].morningShiftHours -
                          repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours !=
                        0
                      ) {
                        morningBonus +=
                          (repetitionOfSpecialRecord[i].morningShiftHours -
                            repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours) *
                            overlapOfBaseValueForMorningSpecial[0] +
                          repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours *
                            overlapOfBaseValueForMorningSpecial[1];
                        {
                          /* console.log(
                        (repetitionOfSpecialRecord[i].morningShiftHours -
                          repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours) *
                          overlapOfBaseValueForMorningSpecial[0] +
                          repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours *
                            overlapOfBaseValueForMorningSpecial[1]
                      ); */
                        }
                      } else {
                        if (repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours === 0) {
                          morningBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours *
                            overlapOfBaseValueForMorningSpecial[0];
                        } else {
                          morningBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours *
                            overlapOfBaseValueForMorningSpecial[1];
                          console.log(
                            repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0] +
                              repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours *
                                overlapOfBaseValueForMorningSpecial[1]
                          );
                        }
                      }

                      if (
                        repetitionOfSpecialRecord[i].afternoonShiftHours -
                          repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours !=
                        0
                      ) {
                        afternoonBonus +=
                          (repetitionOfSpecialRecord[i].afternoonShiftHours -
                            repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours) *
                            overlapOfBaseValueForAfternoonSpecial[0] +
                          repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours *
                            overlapOfBaseValueForAfternoonSpecial[1];
                      } else {
                        if (repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours === 0) {
                          afternoonBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours *
                            overlapOfBaseValueForAfternoonSpecial[0];
                        } else {
                          afternoonBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours *
                            overlapOfBaseValueForAfternoonSpecial[1];
                        }
                      }

                      if (
                        repetitionOfSpecialRecord[i].nightShiftHours -
                          repetitionOfSpecialRecord[i].repetitionOfNightShiftHours !=
                        0
                      ) {
                        nightBonus +=
                          (repetitionOfSpecialRecord[i].nightShiftHours -
                            repetitionOfSpecialRecord[i].repetitionOfNightShiftHours) *
                            overlapOfBaseValueForNightSpecial[0] +
                          repetitionOfSpecialRecord[i].repetitionOfNightShiftHours *
                            overlapOfBaseValueForNightSpecial[1];
                      } else {
                        if (repetitionOfSpecialRecord[i].repetitionOfNightShiftHours === 0) {
                          nightBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfNightShiftHours *
                            overlapOfBaseValueForNightSpecial[0];
                        } else {
                          nightBonus +=
                            repetitionOfSpecialRecord[i].repetitionOfNightShiftHours *
                            overlapOfBaseValueForNightSpecial[1];
                        }
                      }
                    }
                  }
                }

              console.log('basicMorningWage', basicMorningWage);
              console.log('morningBonus', morningBonus);
              console.log('basicAfternoonWage', basicAfternoonWage);
              console.log('afternoonBonus', afternoonBonus);
              console.log('basicNightWage', basicNightWage);
              console.log('nightBonus', nightBonus);

                
                let totalWage =
                  basicWage.morningShiftHours * v.morning_wage +
                  basicWage.afternoonShiftHours * v.afternoon_wage +
                  basicWage.nightShiftHours * v.night_wage;
                if (repetitionOfSpecialRecord.length > 0) {
                  totalWage =
                    basicMorningWage + morningBonus + basicAfternoonWage + afternoonBonus + basicNightWage + nightBonus;
                }

                // 把需要的資料整合成excel格式
                if (recordToExcelFormat.length > 0) {
                  recordToExcelFormat.map((array, i) => {
                    console.log(array[0]);
                    const findResultIndex = array.findIndex((item) => item.individual_id === v.individual_id);
                    {
                      /* console.log(findResultIndex); */
                    }
                    if (findResultIndex !== -1) {
                      recordToExcelFormat[findResultIndex].push({
                        individual_id: v.individual_id,
                        date: moment(v.in_time).format('MM/DD'),
                        time: `${
                          moment(v.in_time).hour() > 9 ? moment(v.in_time).hour() : '0' + moment(v.in_time).hour()
                        }00-${moment(v.out_time).hour()}00`,
                        employee_name: v.name.trim(),
                        wage: totalWage,
                      });
                    } else {
                      recordToExcelFormat.push([
                        {
                          individual_id: v.individual_id,
                          date: moment(v.in_time).format('MM/DD'),
                          time: `${
                            moment(v.in_time).hour() > 9 ? moment(v.in_time).hour() : '0' + moment(v.in_time).hour()
                          }00-${moment(v.out_time).hour()}00`,
                          employee_name: v.name.trim(),
                          wage: totalWage,
                        },
                      ]);
                    }
                  });
                } else {
                  recordToExcelFormat.push([
                    {
                      individual_id: v.individual_id,
                      date: moment(v.in_time).format('MM/DD'),
                      time: `${
                        moment(v.in_time).hour() > 9 ? moment(v.in_time).hour() : '0' + moment(v.in_time).hour()
                      }00-${moment(v.out_time).hour()}00`,
                      employee_name: v.name.trim(),
                      wage: totalWage,
                    },
                  ]);
                }

                {
                  /* console.log(record); */
                }
                return (
                  <tr key={i} className="h-10 hover:bg-emerald-50">
                    <td className="">{v.individual_name}</td>
                    <td>{v.name}</td>
                    <td>{v.in_lat_lng}</td>
                    <td>{v.out_lat_lng}</td>
                    <td className="w-fit">{moment(v.in_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                    <td className="w-fit">{moment(v.out_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                    <td>{totalWage}</td>
                    <td>
                      <Link
                        to={`/addClockRecord/${v.id}`}
                        className="h-full flex justify-center items-center font-bold bg-sky-700 text-white border px-3 py-1 w-max cursor-pointer"
                      >
                        編輯
                      </Link>
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
    </div>
  );
};

export default ClockRecord;
