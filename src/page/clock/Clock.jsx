import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/config';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Clock = () => {
  const MySwal = withReactContent(Swal);

  const [buttonStatus, setButtonStatus] = useState(true);

  const userId = localStorage.getItem('userId');
  const name = localStorage.getItem('name');
  const individualId = localStorage.getItem('individualId');

  const toastSuccess = {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };
  const toastError = {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

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
            let error_message;
            if (error.code === 1) {
              error_message = '沒有獲取地理位置信息的權限';
            } else if (error.code === 2) {
              error_message = '地理位置信息資訊錯誤';
            } else if (error.code === 3) {
              error_message = '取得地理資訊超過時限';
            }
            toast.error(error_message, toastError);
            resolve();
          }
        );
      } else {
        toast.error('Geolocation is not supported by your browser', toastError);
      }
    });
  }

  async function handleClick(type) {
    if (buttonStatus) {
      Swal.fire({
        title: `確定要打卡嗎?`,
        html: `個案代號 : ${individualId}<br>特護名稱 : ${name}<br><br><p style="color: gray;font-size: 14px">如上列資訊有誤，請重新登入再試</p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '打卡',
        cancelButtonText: '取消',
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (!userId || userId === 'undefined' || !individualId || individualId === 'undefined') {
            toast.error('個案代碼或特護為空，請重新登入', toastError);
            return false;
          }
          setButtonStatus(false);
          try {
            const position = await getCurrentPosition();
            let res = await axios.post(
              `${API_URL}/addClockRecord`,
              {
                id: userId,
                individual_id: individualId,
                type: type,
                lat: position?.lat,
                lng: position?.lng,
              },
              {
                headers: {
                  'Cache-Control': 'no-store',
                  Pragma: 'no-store',
                  Expires: '0',
                },
              }
            );
            console.log(res);
            if (res.data.status) {
              toast.success(res.data.message, toastSuccess);
            } else {
              toast.error(res.data.message, toastError);
            }
          } catch (postError) {
            toast.error(postError.message || '打卡失敗，請稍後再試', toastError);
          } finally {
            setButtonStatus(true);
          }
        }
      });
    } else {
      toast.error('新增打卡紀錄中，請等待新增完成', toastError);
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
