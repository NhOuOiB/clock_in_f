import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import moment from 'moment/moment';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { IconContext } from 'react-icons';
import { FaMapMarkerAlt } from 'react-icons/fa';

const ClockRecord = () => {
  const [record, setRecord] = useState([]);
  const [settlement, setSettlement] = useState([]);
  const [specialCaseRecord, setSpecialCaseRecord] = useState([]);
  const [searchCondition, setSearchCondition] = useState({
    begin: '',
    end: '',
    settlement_id: '',
    individual_id: '',
  });
  const [device, setDevice] = useState(document.documentElement.clientWidth > 500 ? 'PC' : 'Mobile');
  const [recordDetail, setRecordDetail] = useState({ status: false, id: '' });
  let recordToExcelFormat = [];
  const permission = localStorage.getItem('permission');
  const employee_id = localStorage.getItem('userId');

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
      if (permission == 2) {
        data = await axios.get(`${API_URL}/getClockRecordByEmployee`, { params: { employee_id: employee_id } });
      } else {
        data = await axios.get(`${API_URL}/getClockRecord`, { params: searchCondition });
      }
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
      });

      let sortedByDate = array.sort((a, b) => new Date(a.date) - new Date(b.date));

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
        if (currentEmployee.time.includes('NaN')) {
          continue;
        }
        let matchingEmployee = employeeWage.find((e) => {
          return e.date === currentEmployee.employee_name;
        });

        if (matchingEmployee) {
          matchingEmployee.time += Number(currentEmployee.wage);
          matchingEmployee.wage += Number(currentEmployee.wage);
        } else {
          employeeWage.push({
            date: currentEmployee.employee_name,
            time: currentEmployee.wage,
            employee_name: '',
            wage: currentEmployee.wage,
          });
        }
      }
      modifiedRecord[i] = modifiedRecord[i].concat(employeeWage);
    }

    modifiedRecord.map((file) => {
      let removeIndividual = file.map(({ individual_id, ...rest }) => rest);
      const merge = [];

      for (let i = 0; i < file.length - 1; i++) {
        const currentDate = file[i].date;
        if (currentDate === '總和') {
          break;
        }
        if (i == 0) {
          merge.push({ s: { r: i + 1, c: 0 }, e: { r: i + 1, c: 0 } });
        } else {
          const lastDate = file[i - 1].date;

          if (lastDate != currentDate) {
            // 如果還沒有追蹤過這個 date，則初始化起始行數
            merge.push({ s: { r: i + 1, c: 0 }, e: { r: i + 1, c: 0 } });
          } else {
            // 如果已經追蹤過這個 date，則更新結束行數
            merge[merge.length - 1].e.r = i + 1;
          }
        }
      }

      const header = ['date', 'time', 'employee_name', 'wage'];
      const headerDisplay = { date: '日期', time: '時間', employee_name: '簽到人', wage: '金額' };
      const correctHeader = [headerDisplay, ...removeIndividual];
      const ws = XLSX.utils.json_to_sheet(correctHeader, { header: header, skipHeader: true });
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      // const merge = [{ s: { r: 1, c: 0 }, e: { r: 3, c: 0 } }];
      ws['!merges'] = merge;

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

    // RWD
    window.addEventListener('resize', () => {
      if (document.documentElement.clientWidth > 500) {
        setDevice('PC');
      } else {
        setDevice('Mobile');
      }
    });
  }, []);

  useEffect(() => {
    fetchRecordData(searchCondition);
    fetchSpecialCaseRecordData(searchCondition);
  }, [searchCondition]);

  function computeData(v) {
    class ShiftHourCalculator {
      constructor(workStart, workEnd, workStartBefore30, workEndBefore30) {
        workStart = this.workStart = workStart;
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

        if (workStart < 8) {
          this.nightShiftHours += workStartBefore30;
        } else if (workStart >= 8 && workStart <= 16) {
          this.morningShiftHours += workStartBefore30;
        } else {
          this.afternoonShiftHours += workStartBefore30;
        }

        if (workEnd < 8) {
          this.nightShiftHours += workEndBefore30;
        } else if (workEnd >= 8 && workEnd <= 16) {
          this.morningShiftHours += workEndBefore30;
        } else {
          this.afternoonShiftHours += workEndBefore30;
        }

        this.totalHour = this.morningShiftHours + this.afternoonShiftHours + this.nightShiftHours;
      }
    }

    const findPrevious = record.find(({ out_time }) => {
      return moment(out_time).format('YYYYMMDDHH') === moment(v.in_time).format('YYYYMMDDHH');
    });
    let workStart = moment(v.in_time).hour();
    let workStartBefore30 = 0;
    if (moment(v.in_time).minutes() > 30) {
      workStart = moment(v.in_time).add(1, 'hours').hour();
    } else if (moment(v.in_time).minutes() > 0) {
      workStart = moment(v.in_time).add(1, 'hours').hour();
      workStartBefore30 = 0.5;
    }
    let workEnd = moment(v.out_time).hour();
    let workEndBefore30 = 0;
    if (moment(v.out_time).minutes() >= 30) {
      workEndBefore30 = 0.5;
    }

    const totalHour = new ShiftHourCalculator(workStart, workEnd, workStartBefore30, workEndBefore30);
    totalHour.calculate();

    let supplement = 0;
    if (findPrevious === undefined) {
      if (v.type_name === '一般') {
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

    const basicWage = new ShiftHourCalculator(workStart, workEnd, workStartBefore30, workEndBefore30);
    basicWage.calculate();

    let basicMorningWage;
    let basicAfternoonWage;
    let basicNightWage;
    if (findPrevious === undefined && totalHour.totalHour < 8) {
      basicMorningWage = basicAfternoonWage = basicNightWage = Math.min(v.morning_wage, v.afternoon_wage, v.night_wage);
    } else {
      basicMorningWage = v.morning_wage;
      basicAfternoonWage = v.afternoon_wage;
      basicNightWage = v.night_wage;
    }
    let morningBonus = 0;
    let afternoonBonus = 0;
    let nightBonus = 0;
    let overlapOfBaseValueForMorningSpecial = [];
    let overlapOfBaseValueForAfternoonSpecial = [];
    let overlapOfBaseValueForNightSpecial = [];
    let repetitionOfSpecialRecord = [];
    let morningWage = basicWage.morningShiftHours * basicMorningWage;
    let afternoonWage = basicWage.afternoonShiftHours * basicAfternoonWage;
    let nightWage = basicWage.nightShiftHours * basicNightWage;

    for (const scr of specialCaseRecord) {
      if (
        (scr.begin < v.in_time && scr.end > v.in_time && scr.end < v.out_time) ||
        (scr.begin < v.out_time && scr.begin > v.in_time && scr.end > v.out_time) ||
        (scr.begin < v.in_time && scr.end > v.out_time)
      ) {
        let begin = moment.max(moment(scr.begin), moment(v.in_time));
        let end = moment.min(moment(scr.end), compensation);

        let OverlapOfWorkHoursWithSpecialCase = new ShiftHourCalculator(
          begin.hour(),
          end.hour(),
          workStartBefore30,
          workEndBefore30
        );
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
          nextRecord[`repetitionOf${shiftType.charAt(0).toUpperCase() + shiftType.slice(1)}`] = repetition[shiftType];
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

      overlapOfBaseValueForMorningSpecial.push(baseValueForMorningSpecial);
      overlapOfBaseValueForAfternoonSpecial.push(baseValueForAfternoonSpecial);
      overlapOfBaseValueForNightSpecial.push(baseValueForNightSpecial);
    }

    function calculateBaseValue(baseWage, overlapArray, multiple) {
      let totalOverlap = overlapArray.reduce((acc, val) => acc + val, 0);
      return (baseWage + totalOverlap) * (multiple - 1);
    }

    for (let i = 0; i < repetitionOfSpecialRecord.length; i++) {
      if (repetitionOfSpecialRecord.length === 1) {
        morningBonus += repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0];
        afternoonBonus += repetitionOfSpecialRecord[i].afternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[0];
        nightBonus += repetitionOfSpecialRecord[i].nightShiftHours * overlapOfBaseValueForNightSpecial[0];
      } else if (repetitionOfSpecialRecord.length > 1) {
        if (i === 0) {
          morningBonus += repetitionOfSpecialRecord[i].morningShiftHours * overlapOfBaseValueForMorningSpecial[0];
          afternoonBonus += repetitionOfSpecialRecord[i].afternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[0];
          nightBonus += repetitionOfSpecialRecord[i].nightShiftHours * overlapOfBaseValueForNightSpecial[0];
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
              repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours * overlapOfBaseValueForMorningSpecial[1];
          } else {
            if (repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours === 0) {
              morningBonus +=
                repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours * overlapOfBaseValueForMorningSpecial[0];
            } else {
              morningBonus +=
                repetitionOfSpecialRecord[i].repetitionOfMorningShiftHours * overlapOfBaseValueForMorningSpecial[1];
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
              repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[1];
          } else {
            if (repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours === 0) {
              afternoonBonus +=
                repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[0];
            } else {
              afternoonBonus +=
                repetitionOfSpecialRecord[i].repetitionOfAfternoonShiftHours * overlapOfBaseValueForAfternoonSpecial[1];
            }
          }

          if (
            repetitionOfSpecialRecord[i].nightShiftHours - repetitionOfSpecialRecord[i].repetitionOfNightShiftHours !=
            0
          ) {
            nightBonus +=
              (repetitionOfSpecialRecord[i].nightShiftHours -
                repetitionOfSpecialRecord[i].repetitionOfNightShiftHours) *
                overlapOfBaseValueForNightSpecial[0] +
              repetitionOfSpecialRecord[i].repetitionOfNightShiftHours * overlapOfBaseValueForNightSpecial[1];
          } else {
            if (repetitionOfSpecialRecord[i].repetitionOfNightShiftHours === 0) {
              nightBonus +=
                repetitionOfSpecialRecord[i].repetitionOfNightShiftHours * overlapOfBaseValueForNightSpecial[0];
            } else {
              nightBonus +=
                repetitionOfSpecialRecord[i].repetitionOfNightShiftHours * overlapOfBaseValueForNightSpecial[1];
            }
          }
        }
      }
    }

    let totalWage = morningWage + afternoonWage + nightWage;

    if (repetitionOfSpecialRecord.length > 0) {
      totalWage = morningWage + morningBonus + afternoonWage + afternoonBonus + nightWage + nightBonus;
    }

    function excelForm(v) {
      return {
        individual_id: v.individual_id,
        date: moment(v.in_time).format('MM/DD'),
        time:
          `${moment(v.in_time).hour() > 9 ? moment(v.in_time).hour() : '0' + moment(v.in_time).hour()}00` +
          '-' +
          `${moment(v.out_time).hour() > 9 ? moment(v.out_time).hour() : '0' + moment(v.out_time).hour()}00`,
        employee_name: v.name.trim(),
        wage: totalWage,
      };
    }
    // 把需要的資料整合成excel格式
    if (v.in_time != null && v.out_time != null) {
      if (recordToExcelFormat.length > 0) {
        recordToExcelFormat.map((array, i) => {
          const findResultIndex = array.findIndex((item) => item.individual_id === v.individual_id);
          if (findResultIndex !== -1) {
            recordToExcelFormat[findResultIndex].push(excelForm(v));
          } else {
            recordToExcelFormat.push([excelForm(v)]);
          }
        });
      } else {
        recordToExcelFormat.push([excelForm(v)]);
      }
    }

    return {
      totalWage: totalWage,
    };
  }

  return (
    <div className="w-full flex flex-col justify-center items-center relative">
      <div className="w-full 2xl:w-3/4 flex flex-col mt-10">
        {permission == 1 ? (
          <div className="flex flex-col justify-center items-start md:gap-6 mb-4 md:mb-12 gap-4">
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-center items-start md:gap-2 gap-2">
                <div>篩選時間</div>
                <div className="sm:block flex flex-col gap-4">
                  <input
                    type="datetime-local"
                    className="bg-white border border-black"
                    name="begin"
                    value={searchCondition.begin}
                    onChange={(e) => handleChange(e)}
                  />
                  <span className="hidden sm:inline"> ~ </span>
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
            <div className="grid sm:grid-cols-2 md:gap-6 gap-2">
              <div className="flex flex-col items-start gap-2">
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
              <div className="min-h-full flex flex-col justify-between items-start gap-2">
                <div>個案代碼</div>
                <div>
                  <input
                    className="bg-white border border-[#444]"
                    name="individual_id"
                    type="text"
                    onChange={(e) => handleChange(e)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link
              to={'/addClockRecord'}
              className="h-full flex justify-center items-center font-bold bg-green-600 text-white border w-fit px-3 py-1 cursor-pointer"
            >
              新增
            </Link>
          </div>
          {device === 'PC' ? (
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
                  let totalWage = computeData(v).totalWage;
                  return (
                    <tr key={i} className="h-10 hover:bg-emerald-50">
                      <td className="">{v.individual_name}</td>
                      <td>{v.name}</td>
                      <td>{v.in_lat_lng}</td>
                      <td>{v.out_lat_lng}</td>
                      <td className="w-fit">{moment(v.in_time).format('YYYY年MM月DD日 HH點mm分')}</td>
                      <td className="w-fit">{`${
                        v.out_time !== null ? moment(v.out_time).format('YYYY年MM月DD日 HH點mm分') : ''
                      }`}</td>
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
          ) : (
            <div>
              {record.map((v, i) => {
                function handleClick() {
                  setRecordDetail({ status: true, id: v.id });
                }
                let totalWage = computeData(v).totalWage;
                return (
                  <div
                    key={i}
                    className={`mb-3 border border-gray-600 rounded-md mx-2 py-4 grid gap-2`}
                    onClick={handleClick}
                  >
                    <div className={`flex justify-evenly items-center mx-2 py-3 `}>
                      <div>{v.individual_name}</div>
                      <div>{v.name}</div>
                      <>
                        <div className={`${recordDetail.id === v.id && 'hidden'}`}>
                          <div>{moment(v.in_time).format('YY/MM/DD')}</div>
                          <div>{moment(v.in_time).format('HH:mm')}</div>
                        </div>
                        <div className={`${recordDetail.id === v.id && 'hidden'}`}>
                          <div>{moment(v.out_time).format('YY/MM/DD')}</div>
                          <div>{moment(v.out_time).format('HH:mm')}</div>
                        </div>
                      </>
                    </div>
                    <div className={`${recordDetail.status && recordDetail.id === v.id ? 'grid-1fr' : 'grid-0fr'}`}>
                      <div className={`overflow-hidden grid gap-2`}>
                        <div className="flex justify-center items-center gap-10 py-3 mx-2">
                          <div className="flex items-center gap-4">
                            <div>
                              <div>{moment(v.in_time).format('YY/MM/DD')}</div>
                              <div>{moment(v.in_time).format('HH:mm')}</div>
                            </div>
                            <IconContext.Provider value={{ size: '2rem', className: 'cursor-pointer' }}>
                              <Link to={`https://www.google.com/maps/search/?api=1&query=${v.in_lat_lng}`}>
                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(v.in_lat_lng);
                                  }}
                                >
                                  <FaMapMarkerAlt />
                                </div>
                              </Link>
                            </IconContext.Provider>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <div>{moment(v.out_time).format('YY/MM/DD')}</div>
                              <div>{moment(v.out_time).format('HH:mm')}</div>
                            </div>
                            <IconContext.Provider value={{ size: '2rem', className: 'cursor-pointer' }}>
                              <Link to={`https://www.google.com/maps/search/?api=1&query=${v.out_lat_lng}`}>
                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(v.out_lat_lng);
                                  }}
                                >
                                  <FaMapMarkerAlt />
                                </div>
                              </Link>
                            </IconContext.Provider>
                          </div>
                        </div>
                        <div className="mx-2 py-3 flex justify-center">
                          <p className=" bg-amber-100 p-2 rounded-xl">{`薪資 : $${totalWage}`}</p>
                        </div>
                        <div className="py-3 flex justify-center gap-12">
                          <Link
                            to={`/addClockRecord/${v.id}`}
                            className="h-full flex justify-center items-center font-bold bg-stone-700 text-white border px-3 py-1 w-max cursor-pointer"
                          >
                            編輯
                          </Link>
                          <div
                            className=" bg-stone-700 text-white border px-3 py-1 w-max cursor-pointer"
                            onClick={() => handleDelete(v.id)}
                          >
                            刪除
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClockRecord;
