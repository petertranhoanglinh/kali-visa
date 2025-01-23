import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ChatMessage } from 'src/app/model/chatMessage.model';
import { WebSocketService } from 'src/app/service/web-socket-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-ting',
  templateUrl: './chat-ting.component.html',
  styleUrls: ['./chat-ting.component.css']
})
export class ChatTingComponent implements OnInit , OnChanges  {

  @ViewChild('messages') private messagesContainer!:ElementRef;
  @ViewChild('notificationSound') private notificationSound!  : ElementRef;

  messageInput: string = '';
  id: string="";
  messageList: any[] = [];
  romId:string = '';
  isPopupOpen: boolean = true;
  isPopupOpenImg: boolean = false;

  base64Image: string  = "";
  img: any = '';
  imgName: any = '';
  apiUrl = environment.apiUrl;
  imageClick:string = '';
  askBot : string = '';
  ramdomBotId = CommonUtils.generateRandomString(5)

  constructor(private chatService: WebSocketService,
    private route: ActivatedRoute , private toadstr : ToastrService ,private http: HttpClient
    ){

  }
  ngOnChanges(changes: SimpleChanges): void {
  }




  ngOnInit(): void {
    this.lisenerMessage();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }



  sendMessage(flag:boolean) {

    // Kiểm tra nếu có file ảnh thì upload trước
    if (ValidationUtil.isNotNullAndNotEmpty(this.img) && ValidationUtil.isNotNullAndNotEmpty(this.imgName)) {
      this.uploadFile(this.img);
    } else {
      this.sendMessageWithImage(flag);
    }
  }

  sendMessageWithImage(flag:boolean) {
    const chatMessage = {
      message:flag && this.romId.includes('bot') ? this.askBot : this.messageInput,
      user: this.id,
      image: this.base64Image,
      flag:flag
       // Sử dụng dữ liệu base64 của ảnh (nếu có)
    } as ChatMessage;

    let romId = '';
    if(this.romId.toLowerCase().includes('bot')){
      romId = this.romId + this.ramdomBotId
    }else{
      romId = this.romId
    }
    this.chatService.sendMessage(romId, chatMessage);
    this.base64Image = '';
    this.askBot = this.messageInput;
    this.messageInput = ''; // Reset trường input
  }

  lisenerMessage() {
    this.chatService.getMessageSubject().subscribe((messages: any) => {
      // Lấy tin nhắn mới nhất từ server
      const newMessages = messages.map((item: any) => ({
        ...item,
        message_side: item.user === this.id ? 'sender' : 'receiver'
      }));

      // Kiểm tra nếu tin nhắn mới nhất là từ người khác
      if (newMessages.length > this.messageList.length) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage.message_side === 'receiver') {
          this.playNotificationSound(); // Phát âm thanh nếu là tin nhắn từ người khác
        }
      }

      this.messageList = newMessages;

      const item = this.messageList[this.messageList.length -1];
      if(this.romId.includes('bot') && item.flag == false){
        return this.sendMessage(true);
      }
      this.scrollToBottom(); // Cuộn xuống sau khi cập nhật tin nhắn
    });
  }
  closePopup():void{
    this.chatService.leaveRoom(); // Optional: leave previous room if necessary

    let romId = '';
    if(this.romId.toLowerCase().includes('bot')){
      romId = this.romId + this.ramdomBotId
    }else{
      romId = this.romId
    }
    this.chatService.joinRoom(romId); // Join new room


    if(ValidationUtil.isNotNullAndNotEmpty(this.id)){
      this.isPopupOpen = false;
    }else{
      this.toadstr.warning("please enter the name")
    }

  }

  closePopupImg():void{
    this.isPopupOpenImg = false;

  }


  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Could not scroll to bottom', err);
    }
  }

  private playNotificationSound(): void {
    try {
      this.notificationSound.nativeElement.play();
    } catch (err) {
      console.error('Could not play notification sound', err);
    }
  }


  uploadFile(img: File): void {
  const formData = new FormData();
  formData.append('img', img);

  // Gửi yêu cầu POST đến API
  this.http.post(environment.apiUrl + '/api/products/upload', formData, {
    headers: new HttpHeaders({
      'Accept': 'application/json'
    }),
    observe: 'response'
  }).subscribe(
    (response: any) => {
      if (response.body && response.body.code === 200) {
        this.base64Image = response.body.data; // Lưu dữ liệu base64 nhận được
        this.img = null;
        this.imgName = null;
        console.log("Upload thành công:", response.body);
        this.sendMessageWithImage(false); // Gọi sendMessage khi upload thành công
      } else {
        console.log("Không có file được tải lên.");
      }
    },
    (error) => {
      console.error("Lỗi xảy ra:", error);
    }
  );
}

  changeFileName(file: File) {

        this.img = file;
        this.imgName = file.name;


  }

  isImage(fileName: string): boolean {
    // Kiểm tra nếu fileName không hợp lệ
    if (typeof fileName !== 'string' || fileName.trim() === '') {
      return false;
    }
    // Tách phần mở rộng tệp
    const parts = fileName.split('.');
    // Kiểm tra nếu không có phần mở rộng tệp
    if (parts.length < 2) {
      return false; // Không có phần mở rộng
    }
    // Lấy phần mở rộng và chuyển đổi thành chữ thường
    const extension = parts[parts.length - 1].toLowerCase();
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    return extensions.includes(extension);
  }


  imgClick(img:string){
    if(ValidationUtil.isNotNullAndNotEmpty(img)){
      this.imageClick =img;
      this.isPopupOpenImg = true;
    }

  }


}
