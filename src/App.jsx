import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './page/login/Login';
import Home from './page/home/Home';


function App() {
    return (
        <BrowserRouter initialEntries={['/login']} initialIndex={0} basename="">
            <Routes>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/*" element={<Home />}></Route>
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;
