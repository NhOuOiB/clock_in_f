import Clock from '../clock/Clock';
import Header from '../../component/Header';
import ClockRecord from '../clock/ClockRecord';
import AddClockRecord from '../clock/AddClockRecord';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AddEmployee from '../employee/AddEmployee';
import Employee from '../employee/Employee';
import IndividualCase from '../individual/IndividualCase';
import AddIndividual from '../individual/AddIndividual';
import SpecialCaseRecord from '../specialCase/SpecialCaseRecord';
import AddSpecialCaseRecord from '../specialCase/AddSpecialCaseRecord';
import moment from 'moment';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = moment.now();
      const lastTime = localStorage.getItem('last_time');
      console.log(currentTime - lastTime);

      if (currentTime - lastTime > 5000) {
        navigate('');
      }
    }, 1000);

    // 在組件卸載時清除定時器
    return () => clearInterval(intervalId);
  }, []);
  return (
    <>
      <Header />
      <Routes>
        <Route path="/clock" element={<Clock />}></Route>
        <Route path="/clockRecord" element={<ClockRecord />}></Route>
        <Route path="/addClockRecord" element={<AddClockRecord />}></Route>
        <Route path="/addClockRecord/:id" element={<AddClockRecord />}></Route>
        <Route path="/addEmployee" element={<AddEmployee />}></Route>
        <Route path="/addEmployee/:employee_id" element={<AddEmployee />} />
        <Route path="/employee" element={<Employee />}></Route>
        <Route path="/individual" element={<IndividualCase />}></Route>
        <Route path="/addIndividual" element={<AddIndividual />}></Route>
        <Route path="/addIndividual/:individual_id" element={<AddIndividual />} />
        <Route path="/specialCaseRecord" element={<SpecialCaseRecord />}></Route>
        <Route path="/addSpecialCaseRecord" element={<AddSpecialCaseRecord />}></Route>
        <Route path="/addSpecialCaseRecord/:id" element={<AddSpecialCaseRecord />} />
      </Routes>
    </>
  );
};

export default Home;
