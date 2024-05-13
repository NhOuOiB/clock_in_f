import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Clock = () => {
  const [buttonStatus, setButtonStatus] = useState(true);
  const MySwal = withReactContent(Swal);

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
    try {
      Swal.fire({
        title: `確定要打卡嗎?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '打卡',
        cancelButtonText: '取消',
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (buttonStatus) {
            setButtonStatus(false);
            const position = await getCurrentPosition();

            let res = await axios.post(`${API_URL}/addClockRecord`, {
              id: localStorage.getItem('userId'),
              individual_id: localStorage.getItem('individualId'),
              type: type,
              lat: position.lat,
              lng: position.lng,
            });
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
            setButtonStatus(true);
          }
        }
      });
    } catch (error) {
      console.log('打卡失敗', error);
    }
  }
  return (
    <div className="w-full h-[calc(100%-48px)] flex flex-col justify-center items-center gap-32">
      <div
        className="bg-green-400 text-white w-64 h-44 flex justify-center items-center text-6xl rounded-3xl cursor-pointer"
        onClick={() => {
          handleClick('上班');
        }}
      >
        上班
      </div>
      <div
        className="bg-red-500 text-white w-64 h-44 flex justify-center items-center text-6xl rounded-3xl cursor-pointer"
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
