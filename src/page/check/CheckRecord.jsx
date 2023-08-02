import axios from 'axios';
import auth from '../../auth/auth';
import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/config';
import moment from 'moment/moment';

const CheckRecord = () => {
    auth();
    const [record, setRecord] = useState([]);

    // function reverseGeocode(lat, lng) {
    //     const latlng = new google.maps.LatLng(lat, lng);
    //     const geocoder = new google.maps.Geocoder();

    //     geocoder.geocode({ location: latlng }, (results, status) => {
    //         if (status === google.maps.GeocoderStatus.OK) {
    //             if (results[0]) {
    //                 // 獲取第一個結果的地點名稱
    //                 const locationName = results[0].formatted_address;
    //                 console.log('地點名稱：', locationName);

    //                 // 在網頁上顯示地點名稱
    //                 const locationElement = document.getElementById('location');
    //                 locationElement.innerText = locationName;
    //             } else {
    //                 console.error('找不到地點。');
    //             }
    //         } else {
    //             console.error('地理編碼失敗：', status);
    //         }
    //     });
    // }

    useEffect(() => {
        (async () => {
            let data = await axios.get(`${API_URL}/getCheckRecord`);
            setRecord(data.data);
        })();
    }, []);
    return (
        <div className="w-100 h-[calc(100%-48px)] flex justify-center items-center">
            <table className="mx-2 w-full sm:w-2/3 min-h-2/3 overflow-auto table-auto border border-black">
                <thead className="bg-gray-200 h-10">
                    <tr className="">
                        <th>姓名</th>
                        <th>打卡</th>
                        <th>地點</th>
                        <th>時間</th>
                    </tr>
                </thead>
                <tbody>
                    {record.map((v, i) => {
                        return (
                            <tr key={i} className="h-10">
                                <td>{v.name}</td>
                                <td>{v.type}</td>
                                <td>
                                    {v.lat},{v.lng}
                                </td>
                                <td>{moment(v.time).format('YYYY年MM月DD日 HH點mm分')}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CheckRecord;
