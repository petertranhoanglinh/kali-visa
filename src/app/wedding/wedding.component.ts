import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wedding',
  templateUrl: './wedding.component.html',
  styleUrls: ['./wedding.component.css']
})
export class WeddingComponent implements OnInit {


  qrCodeDataUrl: string = '';
  weddingDetails = {
    groomName: 'HOÀNG LINH',
    brideName: 'THU THANH',
    date: '10 tháng 11 năm 2024',
    time: '11:00',
    bridePhotoUrl: '',
    videoUrl:'',

    venue: {
      name: 'Nhà Hàng Anh Khang',
      address: 'Ấp 5, Huyện Trảng Bom',
      city: 'Đồng Nai, Việt Nam'
    },
    mapUrl: 'https://www.google.com/maps?sca_esv=91c658cd3c6ca43c&rlz=1C1ONGR_enVN1074VN1074&cs=0&kgmid=/g/11tmk8945k&shndl=30&shem=uaasie&kgs=7f8a3409318c52c1&um=1&ie=UTF-8&fb=1&gl=vn&sa=X&geocode=KeWjeXNZ4XQxMSd4gWslmKQH&daddr=%E1%BA%A4p+5,+Tr%E1%BA%A3ng+Bom+District,+Dong+Nai+76000'
  };

  ngOnInit() {

  }

}
