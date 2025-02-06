import { getMessageBox, getMessageByUserid, MessageState } from './../../../selectors/message.selector';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { getMessageBoxAction, getMessageByUserAction, saveMessageAction } from 'src/app/actions/message.action';
import { setShowOverlayLoading } from 'src/app/actions/overlay-loading.action';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { CommonUtils } from 'src/app/common/util/common-utils';
import { ValidationUtil } from 'src/app/common/util/validation.util';
import { ChatMessage } from 'src/app/model/chatMessage.model';
import { MessageModel } from 'src/app/model/message.model';
import { OverlayLoadingState } from 'src/app/selectors/overlay-loading.selector';
import { WebSocketService } from 'src/app/service/web-socket-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'admin-chat-ting',
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.css']
})
export class AdminChatComponent implements OnInit, OnChanges  {

  @ViewChild('messages', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('notificationSound') private notificationSound!: ElementRef;

  messageInput: string = '';

  messageList: ChatMessage[] = [];
  messageDB: ChatMessage[] = [];
  romId: string = '';
  isPopupOpen: boolean = true;
  isPopupOpenImg: boolean = false;

  base64Image: string = "";
  img: any = '';
  imgName: any = '';
  apiUrl = environment.apiUrl;
  imageClick: string = '';
  askBot: string = '';

  messageDB$ = new Observable<MessageModel[]>();
  infoMessages : MessageModel[]  = [] ;
  infoMessages$ =  new Observable<MessageModel[]>();
  infoMessage = {} as MessageModel ;
  page = 0;







  constructor(private chatService: WebSocketService,
    private route: ActivatedRoute
    , private toadstr: ToastrService
    , private http: HttpClient
    , private overlayLoadingStore: Store<OverlayLoadingState>
    , private messageStore: Store<MessageState>
  ) {
    this.messageDB$ = this.messageStore.select(getMessageByUserid)
    this.infoMessages$ = this.messageStore.select(getMessageBox)
   }
  ngOnChanges(changes: SimpleChanges): void {
  }
  ngOnInit(): void {

    if(AuthDetail.getLoginedInfo()?.role != 'admin'){
      window.location.href = '/login'
    }

    this.messageStore.dispatch(getMessageBoxAction({page:100}));

    this.infoMessages$.subscribe(res=>{
        this.infoMessages = res;
    })

  }


  onScroll(event: Event) {
    const element = this.messagesContainer.nativeElement;
    if (element.scrollTop === 0) {
      this.page++;
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }



  sendMessage(flag: boolean) {
    // Kiểm tra nếu có file ảnh thì upload trước
    if (ValidationUtil.isNotNullAndNotEmpty(this.img) && ValidationUtil.isNotNullAndNotEmpty(this.imgName)) {
      this.uploadFile(this.img);
    } else {
      this.sendMessageWithImage(flag);
    }
  }

  sendMessageWithImage(flag: boolean) {
    const chatMessage = {
      message: flag && this.romId.includes('bot') ? this.askBot : this.messageInput,
      user: 'ADMIN',
      image: this.base64Image,
      flag: flag
      // Sử dụng dữ liệu base64 của ảnh (nếu có)
    } as ChatMessage;

    let romId = '';
    if (this.romId.toLowerCase().includes('bot')) {
      romId = this.romId
    } else {
      romId = this.romId
    }
    this.chatService.sendMessage(romId, chatMessage);
    let params = {
      userId : this.infoMessage.userId,
      userName :this.infoMessage.userName,
      amessage: this.messageInput,
      amuti : this.base64Image
    }
    this.messageStore.dispatch(saveMessageAction({params : params}));
    this.base64Image = '';
    this.askBot = this.messageInput;
    this.messageInput = ''; // Reset trường input

  }
  lisenerMessage() {
      this.chatService.getMessageSubject().subscribe((messages: any) => {
      // Lấy tin nhắn mới nhất từ server
      const newMessages = messages.map((item: any) => ({
        ...item,
        message_side: item.user === 'ADMIN' ? 'sender' : 'receiver'
      }));



      // Kết hợp với messageList hiện tại
      this.messageList = [...this.messageDB, ...newMessages];

      // Kiểm tra nếu tin nhắn mới nhất là từ người khác
      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage.message_side === 'receiver') {
          this.playNotificationSound(); // Phát âm thanh nếu là tin nhắn từ người khác
        }

        const item = this.messageList[this.messageList.length - 1];
        if (this.romId.includes('bot') && item.flag === false) {
          return this.sendMessage(true);
        }
      }

      this.scrollToBottom(); // Cuộn xuống sau khi cập nhật tin nhắn
    });
  }

  closePopupImg(): void {
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
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return false;
    }
    const extension = parts[parts.length - 1].toLowerCase();
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    return extensions.includes(extension);
  }


  imgClick(img: string) {
    if (ValidationUtil.isNotNullAndNotEmpty(img)) {
      this.imageClick = img;
      this.isPopupOpenImg = true;
    }

  }

  initChatting() {
    this.romId = String(this.infoMessage.userId)
    this.chatService.joinRoom(this.romId);
  }

  convertMessageDbToMessageList(messageDb: MessageModel[]): ChatMessage[] {
    return messageDb.map(message => {
      const messageContent = message.qmessage || message.amessage || '';
      const imgDB = message.qmuti || message.amuti || '';

      return {
        message: messageContent,
        user: ValidationUtil.isNotNullAndNotEmpty(message.amessage) ||  ValidationUtil.isNotNullAndNotEmpty(message.amuti)  ? 'ADMIN' : message.userName  ,
        image: imgDB,
        flag: false,
        message_side: ValidationUtil.isNotNullAndNotEmpty(message.amessage) ||  ValidationUtil.isNotNullAndNotEmpty(message.amuti)? 'sender' : 'receiver',
      };
    }).reverse();;
  }

  clickInfoUser(item:MessageModel){
    this.infoMessage = item;
    this.lisenerMessage();
    this.overlayLoadingStore.dispatch(setShowOverlayLoading({ loading: true }));
    this.messageStore.dispatch(getMessageByUserAction({ userid: String(this.infoMessage.userId) , page :this.page  }))
    this.messageDB$.subscribe(res => {
      this.messageDB = this.convertMessageDbToMessageList(res);
      this.messageList = this.convertMessageDbToMessageList(res);
    })
    setTimeout(() => {
      this.initChatting();
      this.overlayLoadingStore.dispatch(setShowOverlayLoading({ loading: false }));
    }, 2000);

  }



}
