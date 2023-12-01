import React from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import auth from '../../auth/auth';
import { toast } from 'react-toastify';

const Clock = () => {
  auth();
  async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            resolve({ lat, lng });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'dark',
        });
      }
    });
  }
  async function handleClick(type) {
    const position = await getCurrentPosition();

    let res = await axios.post(`${API_URL}/addClockRecord`, {
      id: localStorage.getItem('userId'),
      individual_id: localStorage.getItem('individualId'),
      type: type,
      lat: position.lat,
      lng: position.lng,
    });
    console.log(res);
    if (res.data.status) {
      toast.success(res.data.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    } else {
      toast.error(res.data.message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    }
  }
  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center">
      <div
        className="bg-green-400 text-white w-80 h-52 flex justify-center items-center text-6xl rounded-3xl mb-10 cursor-pointer"
        onClick={() => {
          handleClick('上班');
        }}
      >
        上班
      </div>
      <div
        className="bg-red-500 text-white w-80 h-52 flex justify-center items-center text-6xl rounded-3xl cursor-pointer"
        onClick={() => {
          handleClick('下班');
        }}
      >
        下班
      </div>
    </div>
  );
};

export default Clock;
