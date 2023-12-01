import Clock from '../clock/Clock';
import Header from '../../component/Header';
import ClockRecord from '../clock/ClockRecord';
import { Routes, Route } from 'react-router-dom';
import AddEmployee from '../employee/AddEmployee';
import auth from '../../auth/auth';
import MakeUpClockIn from '../makeUpClockIn/MakeUpClockIn';
import Employee from '../employee/Employee';
import IndividualCase from '../individual/IndividualCase';
import AddIndividual from '../individual/AddIndividual';
import SpecialCaseRecord from '../specialCase/SpecialCaseRecord';
import AddSpecialCaseRecord from '../specialCase/AddSpecialCaseRecord';

const Home = () => {
  auth();

  //#region 薪資計算
  const workStart = 14;
  const workEnd = 10;

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

  //   console.log(`早班上班小時數: ${morningShiftHours}`);
  //   console.log(`下午班上班小時數: ${afternoonShiftHours}`);
  //   console.log(`夜班上班小時數: ${nightShiftHours}`);

  function calculateOverlapHours(start1, end1, start2, end2) {
    const latestStart = Math.max(start1, start2);
    const earliestEnd = Math.min(end1, end2);

    // 確認是否有重疊區間
    if (earliestEnd <= latestStart) {
      // 沒有重疊區間
      return 0;
    } else {
      // 計算重疊的小時數
      const overlapHours = (earliestEnd - latestStart) / (1000 * 60 * 60);
      return overlapHours;
    }
  }

  // 輸入兩段時間的開始和結束時間（以毫秒表示）
  const startDateTime1 = new Date('2023-10-30T06:00:00').getTime(); // 第一段時間的開始
  const endDateTime1 = new Date('2023-10-30T20:00:00').getTime(); // 第一段時間的結束

  const startDateTime2 = new Date('2023-10-30T12:00:00').getTime(); // 第二段時間的開始
  const endDateTime2 = new Date('2023-10-31T08:00:00').getTime(); // 第二段時間的結束

  // 計算重疊的小時數
  const overlapHours = calculateOverlapHours(startDateTime1, endDateTime1, startDateTime2, endDateTime2);
  console.log('重疊的小時數：', overlapHours);
  //#endregion

  return (
    <>
      <Header />
      <Routes>
        <Route path="/clock" element={<Clock />}></Route>
        <Route path="/clockRecord" element={<ClockRecord />}></Route>
        <Route path="/addEmployee" element={<AddEmployee />}></Route>
        <Route path="/addEmployee/:employee_id" element={<AddEmployee />} />
        <Route path="/employee" element={<Employee />}></Route>
        <Route path="/individual" element={<IndividualCase />}></Route>
        <Route path="/addIndividual" element={<AddIndividual />}></Route>
        <Route path="/addIndividual/:individual_id" element={<AddIndividual />} />
        <Route path="/specialCaseRecord" element={<SpecialCaseRecord />}></Route>
        <Route path="/addSpecialCaseRecord" element={<AddSpecialCaseRecord />}></Route>
        <Route path="/addSpecialCaseRecord/:id" element={<AddSpecialCaseRecord />} />
        <Route path="/makeUpClockIn" element={<MakeUpClockIn />}></Route>
      </Routes>
    </>
  );
};

export default Home;
