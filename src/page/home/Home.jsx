import Check from '../check/Check';
import Header from '../../component/Header';
import CheckRecord from '../check/CheckRecord';
import { Routes, Route } from 'react-router-dom';
import AddEmployee from '../employee/AddEmployee';
import auth from '../../auth/auth'

const Home = () => {
    auth()
    return (
        <>
            <Header />
            <Routes>
                <Route path="/check" element={<Check />}></Route>
                <Route path="/checkRecord" element={<CheckRecord />}></Route>
                <Route path="/addEmployee" element={<AddEmployee />}></Route>
            </Routes>
        </>
    );
};

export default Home;
