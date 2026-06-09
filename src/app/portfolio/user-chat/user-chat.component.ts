import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { MessageService } from 'src/app/service/message.service';
import { SocialService } from 'src/app/service/social.service';
import { WebSocketService } from 'src/app/service/web-socket-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { Subscription } from 'rxjs';
import { UserChatMessage } from 'src/app/model/userChatMessage.model';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css']
})
export class UserChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  friendId: string = '';
  currentUserId: string = '';
  roomId: string = '';
  isLoading: boolean = false;
  isUploading: boolean = false;

  friendUser: any = null;
  currentUserProfile: any = null;

  messageInput: string = '';
  messageList: any[] = [];
  private socketSubscription!: Subscription;

  // Media Attachment
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  previewType: 'IMAGE' | 'VIDEO' | 'NONE' = 'NONE';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private socialService: SocialService,
    private chatService: WebSocketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    if (loginInfo) {
      this.currentUserId = loginInfo.id;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      if (id) {
        this.friendId = id;
        this.calculateRoomId();
        this.loadProfilesAndHistory();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.chatService.leaveRoom(this.roomId);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  calculateRoomId() {
    this.roomId = this.currentUserId.localeCompare(this.friendId) < 0
      ? `${this.currentUserId}_${this.friendId}`
      : `${this.friendId}_${this.currentUserId}`;
  }

  loadProfilesAndHistory() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.markAllMessagesRead(this.friendId, jwt).subscribe();

    this.isLoading = true;

    // Load Friend's details
    this.authService.getProfileById(this.friendId, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.friendUser = res.data.user;
        }
      }
    });

    // Load current user profile details
    this.authService.getProfileById(this.currentUserId, jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200 && res.data) {
          this.currentUserProfile = res.data.user;
        }
      }
    });

    // Load chat messages history
    this.messageService.getMessageByUserid(this.friendId, 0).subscribe({
      next: (res: any) => {
        // Map the backend DB ChatMessage list
        this.messageList = res || [];
        this.isLoading = false;
        
        // Connect to WebSocket room
        this.connectWebSocket();
      },
      error: () => {
        this.toastr.error('Lỗi khi tải lịch sử cuộc trò chuyện.');
        this.isLoading = false;
      }
    });
  }

  connectWebSocket() {
    this.chatService.joinRoom(this.roomId);
    this.socketSubscription = this.chatService.getMessageSubject().subscribe((liveMsgList: any) => {
      if (liveMsgList && liveMsgList.length > 0) {
        // Sync our local list with live messages that belong to this roomId
        const matchingMsgs = liveMsgList.filter((m: any) => m.groupId === this.roomId);
        if (matchingMsgs.length > 0) {
          matchingMsgs.forEach((newMsg: any) => {
            // Find if there is a temporary message sent by us that matches this message
            const tempMsgIndex = this.messageList.findIndex(m => 
              m.sender === newMsg.sender && 
              m.content === newMsg.content && 
              !m.id && // Temporary messages do not have a Mongo ID
              Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 10000
            );

            if (tempMsgIndex > -1) {
              // Replace the temporary message with the server-persisted message (has ID and correct timestamp)
              this.messageList[tempMsgIndex] = newMsg;
            } else {
              // Check if the message is already in the list to prevent duplicates
              const exists = this.messageList.some(m => 
                m.id === newMsg.id || 
                (m.content === newMsg.content && new Date(m.timestamp).getTime() === new Date(newMsg.timestamp).getTime())
              );
              if (!exists) {
                this.messageList.push(newMsg);
              }
            }
          });
          this.scrollToBottom();
        }
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        this.toastr.warning('Dung lượng tệp tối đa là 50MB');
        return;
      }
      this.selectedFile = file;

      if (file.type.startsWith('image/')) {
        this.previewType = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        this.previewType = 'VIDEO';
      } else {
        this.previewType = 'NONE';
        this.toastr.warning('Chỉ hỗ trợ hình ảnh hoặc video ngắn.');
        this.selectedFile = null;
        return;
      }

      // Generate preview URL
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  clearAttachment() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.previewType = 'NONE';
  }

  sendMessage() {
    if (!this.messageInput.trim() && !this.selectedFile) return;

    this.isUploading = true;

    if (this.selectedFile) {
      this.socialService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          this.submitMessage(res.url, res.type);
        },
        error: (err) => {
          this.toastr.error('Lỗi khi tải tệp đính kèm lên.');
          this.isUploading = false;
        }
      });
    } else {
      this.submitMessage('', 'NONE');
    }
  }

  submitMessage(mediaUrl: string, mediaType: string) {
    const chatMessage = {
      content: this.messageInput,
      sender: this.currentUserId,
      groupId: this.roomId,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      timestamp: new Date()
    } as UserChatMessage;

    // Send via STOMP WebSockets
    this.chatService.sendMessage(this.roomId, chatMessage);

    // Save to message list locally to show instantly (if WS feedback takes time)
    const exists = this.messageList.some(m => m.timestamp === chatMessage.timestamp && m.content === chatMessage.content);
    if (!exists) {
      this.messageList.push(chatMessage);
    }

    // Reset input states
    this.messageInput = '';
    this.clearAttachment();
    this.isUploading = false;
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  getDisplayName(firstName?: string, lastName?: string, fallbackName?: string): string {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    if (fullName) return fullName;
    if (fallbackName) {
      if (fallbackName.includes('@')) {
        return fallbackName.split('@')[0];
      }
      return fallbackName;
    }
    return 'Nhà Đầu Tư ẩn danh';
  }
}
