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
