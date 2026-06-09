import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { MessageService } from 'src/app/service/message.service';
import { WebSocketService } from 'src/app/service/web-socket-service.service';
import { ChatTabService } from 'src/app/service/chat-tab.service';
import { SocialService } from 'src/app/service/social.service';
import { AuthDetail } from 'src/app/common/util/auth-detail';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserChatMessage } from 'src/app/model/userChatMessage.model';
import { environment } from 'src/environments/environment';

interface ChatTab {
  friendId: string;
  user: any;
  messages: any[];
  minimized: boolean;
  input: string;
  roomId: string;
  selectedFile: File | null;
  previewUrl: string | ArrayBuffer | null;
  previewType: 'IMAGE' | 'VIDEO' | 'NONE';
  isUploading: boolean;
}

@Component({
  selector: 'app-friend-chat-tabs',
  templateUrl: './friend-chat-tabs.component.html',
  styleUrls: ['./friend-chat-tabs.component.css']
})
export class FriendChatTabsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren('scrollContainer') private scrollContainers!: QueryList<ElementRef>;

  currentUserId: string = '';
  friends: any[] = [];
  activeTabs: ChatTab[] = [];
  isFriendListOpen: boolean = false;

  // Context Menu for message recall
  contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    messageId: '',
    friendId: ''
  };
  apiUrl = environment.apiUrl;
  
  private socketSubscription!: Subscription;
  private tabOpenSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private chatService: WebSocketService,
    private chatTabService: ChatTabService,
    private socialService: SocialService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const loginInfo = AuthDetail.getLoginedInfo();
    if (loginInfo) {
      this.currentUserId = loginInfo.id;
      this.loadFriends();
      this.subscribeToTabService();
      this.connectWebSocketGlobal();
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    if (this.tabOpenSubscription) {
      this.tabOpenSubscription.unsubscribe();
    }
    // Clean up all websocket subscriptions for tabs
    this.activeTabs.forEach(tab => {
      this.chatService.leaveRoom(tab.roomId);
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottomAll();
  }

  loadFriends() {
    const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
    if (!jwt) return;

    this.authService.getFriends(jwt).subscribe({
      next: (res: any) => {
        if (res && res.code === 200) {
          this.friends = res.data || [];
        }
      }
    });
  }

  subscribeToTabService() {
    this.tabOpenSubscription = this.chatTabService.openTab$.subscribe((friendId: string) => {
      this.openChat(friendId);
    });
  }

  calculateRoomId(friendId: string): string {
    return this.currentUserId.localeCompare(friendId) < 0
      ? `${this.currentUserId}_${friendId}`
      : `${friendId}_${this.currentUserId}`;
  }

  openChat(friendId: string) {
    // Check if already open
    const existingIndex = this.activeTabs.findIndex(t => t.friendId === friendId);
    if (existingIndex > -1) {
      this.activeTabs[existingIndex].minimized = false;
      this.isFriendListOpen = false;
      setTimeout(() => this.scrollToBottom(friendId), 100);
      return;
    }

    // Load friend details first from friends list or API
    const friend = this.friends.find(f => f.id === friendId);
    if (friend) {
      this.initTab(friend);
    } else {
      const jwt = localStorage.getItem('jwt') || AuthDetail.getLoginedInfo()?.jwt;
      if (!jwt) return;
      this.authService.getProfileById(friendId, jwt).subscribe({
        next: (res: any) => {
          if (res && res.code === 200 && res.data) {
            this.initTab(res.data.user);
          }
        }
      });
    }
    this.isFriendListOpen = false;
  }

  initTab(friendUser: any) {
    // Limit to max 3 tabs on desktop, 1 on mobile
    const isMobile = window.innerWidth <= 768;
    const maxTabs = isMobile ? 1 : 3;
    if (this.activeTabs.length >= maxTabs) {
      // Close oldest tab
      const oldestTab = this.activeTabs.shift();
      if (oldestTab) {
        this.chatService.leaveRoom(oldestTab.roomId);
      }
    }

    const roomId = this.calculateRoomId(friendUser.id);
    const newTab: ChatTab = {
      friendId: friendUser.id,
      user: friendUser,
      messages: [],
      minimized: false,
      input: '',
      roomId: roomId,
      selectedFile: null,
      previewUrl: null,
      previewType: 'NONE',
      isUploading: false
    };

    this.activeTabs.push(newTab);

    // Join WS Room
    this.chatService.joinRoom(roomId);

    // Load message history
    this.messageService.getMessageByUserid(friendUser.id, 0).subscribe({
      next: (res: any) => {
        newTab.messages = res || [];
        setTimeout(() => this.scrollToBottom(friendUser.id), 100);
      }
    });
  }

  closeChat(friendId: string) {
    const tabIndex = this.activeTabs.findIndex(t => t.friendId === friendId);
    if (tabIndex > -1) {
      const tab = this.activeTabs[tabIndex];
      this.chatService.leaveRoom(tab.roomId);
      this.activeTabs.splice(tabIndex, 1);
    }
  }

  toggleMinimize(friendId: string) {
    const tab = this.activeTabs.find(t => t.friendId === friendId);
    if (tab) {
      tab.minimized = !tab.minimized;
      if (!tab.minimized) {
        setTimeout(() => this.scrollToBottom(friendId), 100);
      }
    }
  }

  connectWebSocketGlobal() {
    this.socketSubscription = this.chatService.getMessageSubject().subscribe((liveMsgList: any) => {
      if (liveMsgList && liveMsgList.length > 0) {
        this.activeTabs.forEach(tab => {
          const matchingMsgs = liveMsgList.filter((m: any) => m.groupId === tab.roomId);
          if (matchingMsgs.length > 0) {
            matchingMsgs.forEach((newMsg: any) => {
              // Check for clear chat message
              if (newMsg.mediaType === 'SYSTEM' && newMsg.content === 'CLEAR_CHAT') {
                tab.messages = [];
                return;
              }

              // Deduplicate and replace temp message
              const tempIndex = tab.messages.findIndex(m =>
                m.sender === newMsg.sender &&
                m.content === newMsg.content &&
                !m.id &&
                Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 10000
              );

              if (tempIndex > -1) {
                tab.messages[tempIndex] = newMsg;
              } else {
                const existingIndex = tab.messages.findIndex(m => m.id === newMsg.id);
                if (existingIndex > -1) {
                  // Update message properties in-place (e.g. for recall)
                  tab.messages[existingIndex] = { ...tab.messages[existingIndex], ...newMsg };
                } else {
                  const exists = tab.messages.some(m =>
                    m.content === newMsg.content && new Date(m.timestamp).getTime() === new Date(newMsg.timestamp).getTime()
                  );
                  if (!exists) {
                    tab.messages.push(newMsg);
                    setTimeout(() => this.scrollToBottom(tab.friendId), 50);
                  }
                }
              }
            });
          }
        });
      }
    });
  }

  onMessageContextMenu(event: MouseEvent, msg: any, tab: ChatTab) {
    if (msg.sender !== this.currentUserId || msg.recalled) {
      return;
    }
    event.preventDefault();
    this.contextMenu.visible = true;
    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.messageId = msg.id;
    this.contextMenu.friendId = tab.friendId;
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.contextMenu.visible = false;
  }

  recallSelectedMessage() {
    if (!this.contextMenu.messageId) return;

    this.messageService.recallMessage(this.contextMenu.messageId).subscribe({
      next: (updatedMsg: any) => {
        this.toastr.success('Đã thu hồi tin nhắn.');
        // Update local list instantly
        const tab = this.activeTabs.find(t => t.friendId === this.contextMenu.friendId);
        if (tab) {
          const idx = tab.messages.findIndex(m => m.id === updatedMsg.id);
          if (idx > -1) {
            tab.messages[idx] = updatedMsg;
          }
        }
        this.closeContextMenu();
      },
      error: () => {
        this.toastr.error('Lỗi khi thu hồi tin nhắn.');
        this.closeContextMenu();
      }
    });
  }

  clearChat(friendId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện cả 2 bên? Hành động này sẽ xóa vĩnh viễn tin nhắn.')) {
      this.messageService.clearChatHistory(friendId).subscribe({
        next: () => {
          this.toastr.success('Đã xóa toàn bộ lịch sử trò chuyện.');
          const tab = this.activeTabs.find(t => t.friendId === friendId);
          if (tab) {
            tab.messages = [];
          }
        },
        error: () => {
          this.toastr.error('Lỗi khi xóa lịch sử trò chuyện.');
        }
      });
    }
  }

  sendMessage(tab: ChatTab) {
    if (!tab.input.trim() && !tab.selectedFile) return;

    tab.isUploading = true;

    if (tab.selectedFile) {
      this.socialService.uploadFile(tab.selectedFile , "chat").subscribe({
        next: (res) => {
          this.submitMessage(tab, res.url, res.type);
        },
        error: (err) => {
          this.toastr.error('Lỗi khi tải tệp đính kèm lên.');
          tab.isUploading = false;
        }
      });
    } else {
      this.submitMessage(tab, '', 'NONE');
    }
  }

  submitMessage(tab: ChatTab, mediaUrl: string, mediaType: string) {
    const chatMessage = {
      content: tab.input,
      sender: this.currentUserId,
      groupId: tab.roomId,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      timestamp: new Date()
    } as UserChatMessage;

    // Send via STOMP WS
    this.chatService.sendMessage(tab.roomId, chatMessage);

    // Show instantly
    const exists = tab.messages.some(m => m.timestamp === chatMessage.timestamp && m.content === chatMessage.content);
    if (!exists) {
      tab.messages.push(chatMessage);
    }

    tab.input = '';
    this.clearAttachment(tab);
    tab.isUploading = false;
    setTimeout(() => this.scrollToBottom(tab.friendId), 50);
  }

  onFileSelected(event: any, tab: ChatTab) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        this.toastr.warning('Dung lượng tệp tối đa là 50MB');
        return;
      }
      tab.selectedFile = file;

      if (file.type.startsWith('image/')) {
        tab.previewType = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        tab.previewType = 'VIDEO';
      } else {
        tab.previewType = 'NONE';
        this.toastr.warning('Chỉ hỗ trợ hình ảnh hoặc video ngắn.');
        tab.selectedFile = null;
        return;
      }

      // Generate preview URL
      const reader = new FileReader();
      reader.onload = e => tab.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  clearAttachment(tab: ChatTab) {
    tab.selectedFile = null;
    tab.previewUrl = null;
    tab.previewType = 'NONE';
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  toggleFriendList() {
    this.isFriendListOpen = !this.isFriendListOpen;
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

  private scrollToBottom(friendId: string): void {
    try {
      const idx = this.activeTabs.findIndex(t => t.friendId === friendId);
      if (idx > -1 && this.scrollContainers) {
        const containersArray = this.scrollContainers.toArray();
        if (containersArray[idx]) {
          containersArray[idx].nativeElement.scrollTop = containersArray[idx].nativeElement.scrollHeight;
        }
      }
    } catch (err) {}
  }

  private scrollToBottomAll(): void {
    try {
      this.scrollContainers.forEach((container) => {
        container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
      });
    } catch (err) {}
  }
}
